import axios from "axios";
import * as z from "zod";
import memories from "./memories";
import storageS3, { FILE_TYPE } from "./storage/aws-s3";
import storageGoogleDrive from "./storage/google-drive";
import util from "./util";
import { Memory, Status, Type } from "@prisma/client";
import { URL } from "url";
import * as log from "../lib/log";
import pLimit from "p-limit";
import dayjs from "dayjs";
import { prisma } from "./connections/prisma";

// Concurrency of 10 promises at once
const limit = pLimit(10);

interface ISnapSaver {
  Memories: any;
  StorageS3: any;
  getMemoriesJson: (email: string, local: boolean) => void;
  downloadMemories: (
    email: string,
    startDate: string,
    endDate: string,
    type: string,
    googleAccessToken: string,
    callback: Function
  ) => void;
  validateMemoriesJson: (json: any) => boolean;
  isMemoriesJsonAvailable: (email: string) => Promise<{
    pending: number;
    success: number;
    failed: number;
    expectedTotal: number | null;
  }>;
  isZipAvailable: (email: string) => Promise<boolean>;
  getZipDownloadLink: (email: string) => Promise<string>;
  getMemoriesDownloadLinks: (email: string) => Promise<string[]>;
}

type MemoryRequest = {
  id: number;
  email: string;
  downloadLink: string;
  fileName: string;
};

export enum StorageProvider {
  "S3",
  "GOOGLE",
}

class SnapSaver implements ISnapSaver {
  Memories: any;
  StorageS3: any;
  StorageGoogleDrive: any;

  constructor() {
    this.Memories = new memories();
    this.StorageS3 = new storageS3();
    this.StorageGoogleDrive = new storageGoogleDrive();
  }

  /**
   * Returns the memories_history.json stored for the user (or from local disk if specified)
   */
  public getMemoriesJson = async (email: string, local: boolean = false) => {
    if (local) {
      const filePath = util.getAbsolutePathLocal(
        "data",
        "memories_history.json"
      );
      return require(filePath);
    }

    return await this.StorageS3.getMemoriesJsonFromS3(email);
  };

  /**
   * @param {any} memories
   * @param {Date} startDate
   * @param {Date} endDate
   */

  /**
   * Downloads (in parallel) all memories that are PENDING download from Snapchat and saves them to S3
   *
   * TODO: Add meta data to image/video so it can be filtered by date in file managers
   * TODO: Resuming downloads if failed midway
   */
  public downloadMemories = async (
    email: string,
    startDate: string,
    endDate: string,
    type: string = "ALL",
    googleDriveAccessToken: string,
    jobDoneCallback: Function
  ) => {
    try {
      await prisma.user.update({
        where: { email: email },
        data: { activeDownload: true },
      });

      const filteredMemories = await this.Memories.filterMemories(
        email,
        startDate,
        endDate,
        type !== "ALL" && type
      );

      if (!filteredMemories.length) {
        log.info(`No memories to download - ${email}`);
        jobDoneCallback(null, { email, message: "done" });
        return;
      }

      const memoryRequests: object[] = filteredMemories.map(
        (memory: Memory): MemoryRequest => {
          return {
            id: memory.id,
            email: memory.email,
            fileName: this.getMediaFileName(memory.date, memory.type),
            downloadLink: memory.downloadLink,
          };
        }
      );

      let googleFolderId = "";
      try {
        googleFolderId = await this.StorageGoogleDrive.getTargetFolderId(
          googleDriveAccessToken
        );
      } catch (err) {
        log.error(`Error getting target Google Drive folder - ${email}`, err);
        jobDoneCallback(err);
        return;
      }

      // Wait for all downloads to be resolved
      let promises = memoryRequests.map((memoryRequest: any) => {
        // Applies concurrency limit
        return limit(async () =>
          this.requestAsync(
            memoryRequest,
            googleFolderId,
            googleDriveAccessToken
          )
        );
      });

      await Promise.all(promises);
      jobDoneCallback(null, { email, message: "done" });
    } catch (err) {
      log.error(`Error downloading memories - ${email}`, err);
      jobDoneCallback(err);
    }

    return memories;
  };

  /**
   * Returns whether memories_history.json exists for user
   */
  public isMemoriesJsonAvailable = async (
    email: string
  ): Promise<{
    pending: number;
    success: number;
    failed: number;
    expectedTotal: number | null;
  }> => {
    const fileKey = this.StorageS3.getPathS3(
      email,
      FILE_TYPE.REGULAR,
      "memories_history.json"
    );
    const user = await this.Memories.getUser(email);
    const memories = await this.Memories.getAllMemories(email);

    return {
      // ready: await this.StorageS3.objectExistsInS3(fileKey),
      pending: memories.filter(
        (memory: Memory) => memory.status == Status.PENDING
      ).length,
      success: memories.filter(
        (memory: Memory) => memory.status == Status.SUCCESS
      ).length,
      failed: memories.filter(
        (memory: Memory) => memory.status == Status.FAILED
      ).length,
      expectedTotal: user ? user.numMemories : null,
    };
  };

  /**
   * Returns whether memories.zip exists for user
   */
  public isZipAvailable = async (email: string): Promise<boolean> => {
    const fileKey = this.StorageS3.getPathS3(
      email,
      FILE_TYPE.REGULAR,
      "memories.zip"
    );
    return await this.StorageS3.objectExistsInS3(fileKey);
  };

  /**
   * Returns link to download memories.zip directly from S3
   */
  public getZipDownloadLink = async (email: string): Promise<string> => {
    const fileKey = this.StorageS3.getPathS3(
      email,
      FILE_TYPE.REGULAR,
      "memories.zip"
    );
    return await this.StorageS3.getSignedDownloadLinkS3(fileKey);
  };

  /**
   * Creates a Zip directory of users memories, if any files available.
   */
  public zipMemories = async (email: string): Promise<string> => {
    // Get list of files in users memory directory
    const dir = this.StorageS3.getPathS3(email, FILE_TYPE.MEMORY);
    const objects = await this.StorageS3.getObjectsInS3Directory(dir);

    if (objects["Contents"]?.length == 0) return "no files found";

    this.startZipMemories(email, objects);
    return "started";
  };

  /**
   * Returns list of URLs to download all memories media from S3 for user by email
   */
  public getMemoriesDownloadLinks = async (
    email: string
  ): Promise<string[]> => {
    const dir = this.StorageS3.getPathS3(email, FILE_TYPE.MEMORY);
    const objects = await this.StorageS3.getObjectsInS3Directory(dir);

    // Wait for all links to be resolved
    return Promise.all(
      objects["Contents"]?.map(async (object: any): Promise<string[]> => {
        return await this.StorageS3.getSignedDownloadLinkS3(
          object["Key"] || ""
        );
      })
    );
  };

  /**
   * Checks if provided object matches the schema of a valid memories_history.json file
   * @param {json} any
   * @throws {Error}
   */
  public validateMemoriesJson = (json: any): boolean => {
    try {
      const schema = z.object({
        "Saved Media": z.array(
          z.object({
            Date: z.string(),
            "Media Type": z.enum(["PHOTO", "VIDEO"]),
            "Download Link": z
              .string()
              .refine((link) => new URL(link).hostname == "app.snapchat.com", {
                message: "Download links must have hostname: app.snapchat.com",
              }),
          })
        ),
      });

      schema.parse(json);
      return true;
    } catch (err) {
      log.error(err);
      return false;
    }
  };

  /**
   * Adds each link in memories_history.json to Postgres
   */
  public processMemoriesJsonInParallel = async (
    email: string,
    json: JSON,
    startDate: string,
    endDate: string,
    type: string = "ALL",
    googleAccessToken: string,
    jobDoneCallback: Function
  ) => {
    return new Promise<void>(async (resolve, reject) => {
      const memories = json["Saved Media"] as any[];

      // Delete existing records for this user to start from new
      await this.Memories.deleteManyByEmail(email);

      // If dev env vars are defined, process a smaller chunk of memories
      const memoriesToProcess = process.env.DEV_FILE_LIMIT
        ? memories.slice(0, process.env.DEV_FILE_LIMIT as unknown as number)
        : memories;
      const chunkSize = process.env.DEV_CHUNK_SIZE
        ? (process.env.DEV_CHUNK_SIZE as unknown as number)
        : 100;

      let promises = memoriesToProcess.map((memory: any) => {
        // Applies concurrency limit
        return limit(async () => this.getMemoryObjectToSave(email, memory));
      });

      const chunks = util.sliceIntoChunks(promises, chunkSize);

      log.info(
        `[UPLOAD] started extracting links, ${chunkSize} at a time - ${email}`
      );

      const promiseChunks = chunks.map((chunk, index) => {
        // Applies concurrency limit
        return limit(async () =>
          this.processChunkMemories(email, chunk, index, chunks.length)
        );
      });

      // Process each chunk of 100
      await Promise.all(promiseChunks);

      log.info(`[UPLOAD] finished extracting links - ${email}`);
      jobDoneCallback(null, { email, message: "done", startDate, endDate, type, googleAccessToken });
      resolve();
    });
  };

  private processChunkMemories = async (email, chunk, index, total) => {
    const processedMemories = await Promise.all(chunk);
    await this.Memories.createMemories(processedMemories);
    log.info(`[UPLOAD] processed ${index + 1}/${total} chunks - ${email}`);
  };

  /**
   * Converts a memory entry in memories JSON to an object Memory table expects
   */
  private getMemoryObjectToSave = async (email: string, memory: any) => {
    const snapchatLink = memory["Download Link"];
    const download = {};

    try {
      // TODO: Don't do this if the record already exists
      download["downloadLink"] = await this.getDownloadLinkFromSnapchat(
        snapchatLink
      );
      download["status"] = Status.PENDING;
    } catch {
      download["downloadLink"] = "";
      download["status"] = Status.FAILED;
    }

    return {
      email,
      date: new Date(memory["Date"]),
      type: memory["Media Type"],
      snapchatLink,
      downloadLink: download["downloadLink"],
      status: download["status"],
    };
  };

  /**
   * Extracts image URL from Snapchat's link
   */
  private getDownloadLinkFromSnapchat = async (url: string) => {
    const res = await axios({
      method: "post",
      url,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return res.data;
  };

  /**
   * Asynchronously download the actual image/video file for this memory and save it to S3
   */
  private requestAsync = (
    memoryRequest: MemoryRequest,
    googleFolderId?: string,
    googleDriveAccessToken?: string
  ) => {
    return new Promise((resolve, reject) => {
      const { id, email, downloadLink, fileName } = memoryRequest;
      axios({
        method: "get",
        url: downloadLink,
        responseType: "stream",
        // responseType: "arraybuffer", // TODO: Currently S3 expects arraybuffer, GDrive expects steam lol
      }).then(async (res) => {
        try {
          if (googleDriveAccessToken) {
            // Upload to GDrive
            await this.StorageGoogleDrive.uploadMediaFile(
              googleDriveAccessToken,
              googleFolderId,
              fileName,
              res.data,
              memoryRequest.id
            );
          } else {
            // Upload to S3
            const buffer = Buffer.from(res.data, "binary");
            await this.StorageS3.uploadDataToS3(
              buffer,
              fileName,
              email,
              FILE_TYPE.MEMORY,
              id
            );
          }

          // log.success(`Successfully downloaded ${fileName}`);
          resolve("done");
        } catch (err) {
          log.error(`Error while downloading ${fileName}: ${err}`);
          reject(err);
        }
      });
    });
  };

  /**
   * Creates a Zip directory of users memories. Currently: downloads available media from /memories
   * directory to local disk, zips em up, and uploads Zip file back to S3.
   */
  private startZipMemories = async (
    email: string,
    objects: any[]
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Download all memory media files from S3
        // TODO: For now getting first 10 til we figure out disk challenge
        const downloadDir = util.createDirIfNotExists(
          "./temp/memories/" + email
        );
        objects["Contents"]?.slice(0, 10).forEach(async (object: any) => {
          const fileKey = object["Key"] as string;
          this.StorageS3.downloadFileFromS3(downloadDir, fileKey);
        });

        // Create compressed ZIP file and uplaod to S3
        const zipDir = util.createDirIfNotExists("./temp/zips/" + email);
        const zipPath = zipDir + "/memories.zip";
        const zipBuffer: Buffer | undefined = await util.zipDirectory(
          downloadDir,
          zipPath
        );
        if (zipBuffer)
          this.StorageS3.uploadDataToS3(
            zipBuffer,
            "memories.zip",
            email,
            FILE_TYPE.REGULAR
          );
        // deleteDir(downloadDir)
        resolve();
      } catch (err) {
        log.error(`Error zipping memories`, err);
        reject();
      }
    });
  };

  /**
   * Returns file name with appropriate extension
   */
  private getMediaFileName = (date: Date, type: Type): string => {
    const formattedDate = dayjs(date).format("YYYY/MM/DD HH-mm-ss");
    return `${formattedDate}${type == "PHOTO" ? ".jpg" : ".mp4"}`;
  };
}

export default SnapSaver;
