import axios from "axios";
import * as z from "zod";
import memories from "./memories";
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
  StorageGoogleDrive: any;
  downloadMemoriesFromJson: (
    email: string,
    startDate: string,
    endDate: string,
    type: string,
    googleAccessToken: string,
    callback: Function
  ) => void;
  validateMemoriesJson: (json: any) => boolean;
  processMemoriesJsonInParallel: (
    email: string,
    startDate: string,
    endDate: string,
    type: string,
    googleAccessToken: string,
    jobDoneCallback: Function
  ) => Promise<void>;
}

type MemoryRequest = {
  email: string;
  date: Date;
  type: string;
  status: string;
  snapchatLink: string;
  downloadLink: string;
  fileName: string;
};

class SnapSaver implements ISnapSaver {
  Memories: any;
  StorageGoogleDrive: any;

  constructor() {
    this.Memories = new memories();
    this.StorageGoogleDrive = new storageGoogleDrive();
  }

  public downloadMemoriesFromJson = async (
    email: string,
    startDate: string,
    endDate: string,
    type: string = "ALL",
    googleAccessToken: string,
    jobDoneCallback: Function
  ) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        log.error(
          `Failed to process memories JSON, user not found - ${email}`
        );
        jobDoneCallback(null, { email, message: "user not found" });
        return
      }

      const googleFileId = user.memoriesFileId;
      const googleFolderId = user.memoriesFolderId;

      if (!googleFileId || !googleFolderId) {
        jobDoneCallback(null, { email, message: "missing google file id or folder id" });
        return
      }

      await prisma.user.update({
        where: { email: email },
        data: { activeDownload: true },
      });

      const json = await this.StorageGoogleDrive.getFileById(
        googleAccessToken,
        googleFileId
      );
      const memories = json["Saved Media"] as any[];

      // If dev env vars are defined, process a smaller chunk of memories
      const memoriesToProcess = process.env.DEV_FILE_LIMIT
        ? memories.slice(0, process.env.DEV_FILE_LIMIT as unknown as number)
        : memories;

      await prisma.user.update({
        where: { email },
        data: { memoriesTotal: memoriesToProcess.length },
      });

      // Wait for all downloads to be resolved
      let promises = memoriesToProcess.map((memory: any) => {
        // Applies concurrency limit
        return limit(async () => {
          const memoryRequest = await this.getMemoryObjectToSave(email, memory);

          if (memoryRequest.status == Status.PENDING) {
            await this.requestAsync(
              memoryRequest,
              googleFolderId,
              googleAccessToken
            );
          } else if (memoryRequest.status == Status.FAILED) {
            await this.Memories.incrementMemoryStatusOnUser(email, memoryRequest.status);
          }
        });
      });

      await Promise.all(promises);
      jobDoneCallback(null, { email, message: "done" });
    } catch (err) {
      await prisma.user.update({
        where: { email: email },
        data: { activeDownload: false },
      });
      jobDoneCallback(err);
    }
  };

  /**
   * Downloads (in parallel) all memories that are PENDING download from Snapchat and saves them to S3
   *
   * TODO: Add meta data to image/video so it can be filtered by date in file managers
   * TODO: Resuming downloads if failed midway
   */
  // public downloadMemories = async (
  //   email: string,
  //   startDate: string,
  //   endDate: string,
  //   type: string = "ALL",
  //   googleDriveAccessToken: string,
  //   jobDoneCallback: Function
  // ) => {
  //   try {
  //     await prisma.user.update({
  //       where: { email: email },
  //       data: { activeDownload: true },
  //     });

  //     const filteredMemories = await this.Memories.filterMemories(
  //       email,
  //       startDate,
  //       endDate,
  //       type !== "ALL" && type
  //     );

  //     if (!filteredMemories.length) {
  //       log.info(`No memories to download - ${email}`);
  //       jobDoneCallback(null, { email, message: "done" });
  //       return;
  //     }

  //     const memoryRequests: object[] = filteredMemories.map(
  //       (memory: Memory): MemoryRequest => {
  //         return {
  //           id: memory.id,
  //           email: memory.email,
  //           fileName: this.getMediaFileName(memory.date, memory.type),
  //           downloadLink: memory.downloadLink,
  //         };
  //       }
  //     );

  //     let googleFolderId = "";
  //     try {
  //       googleFolderId = await this.StorageGoogleDrive.getTargetFolderId(
  //         googleDriveAccessToken
  //       );
  //     } catch (err) {
  //       log.error(`Error getting target Google Drive folder - ${email}`, err);
  //       jobDoneCallback(err);
  //       return;
  //     }

  //     // Wait for all downloads to be resolved
  //     let promises = memoryRequests.map((memoryRequest: any) => {
  //       // Applies concurrency limit
  //       return limit(async () =>
  //         this.requestAsync(
  //           memoryRequest,
  //           googleFolderId,
  //           googleDriveAccessToken
  //         )
  //       );
  //     });

  //     await Promise.all(promises);
  //     jobDoneCallback(null, { email, message: "done" });
  //   } catch (err) {
  //     log.error(`Error downloading memories - ${email}`, err);
  //     jobDoneCallback(err);
  //   }

  //   return memories;
  // };

  // /**
  //  * Returns whether memories_history.json exists for user
  //  */
  // public getDownloadStatus = async (
  //   email: string
  // ): Promise<{
  //   pending: number;
  //   success: number;
  //   failed: number;
  //   expectedTotal: number | null;
  // }> => {
  //   const user = await this.Memories.getUser(email);
  //   const memories = await this.Memories.getAllMemories(email);

  //   return {
  //     // ready: await this.StorageS3.objectExistsInS3(fileKey),
  //     pending: memories.filter(
  //       (memory: Memory) => memory.status == Status.PENDING
  //     ).length,
  //     success: memories.filter(
  //       (memory: Memory) => memory.status == Status.SUCCESS
  //     ).length,
  //     failed: memories.filter(
  //       (memory: Memory) => memory.status == Status.FAILED
  //     ).length,
  //     expectedTotal: user ? user.numMemories : null,
  //   };
  // };

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
    startDate: string,
    endDate: string,
    type: string = "ALL",
    googleAccessToken: string,
    jobDoneCallback: Function
  ): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user)
        return log.error(
          `Failed to process memories JSON, user not found - ${email}`
        );

      const json = await this.StorageGoogleDrive.getFileById(
        googleAccessToken,
        user.memoriesFileId
      );
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
      jobDoneCallback(null, {
        email,
        message: "done",
        startDate,
        endDate,
        type,
        googleAccessToken,
      });
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

    const date = new Date(memory["Date"]);
    const type = memory["Media Type"];
    return {
      email,
      date,
      type,
      snapchatLink,
      downloadLink: download["downloadLink"],
      status: download["status"],
      fileName: this.getMediaFileName(date, type),
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
    googleFolderId: string,
    googleDriveAccessToken: string
  ) => {
    return new Promise((resolve, reject) => {
      const { email, downloadLink, fileName } = memoryRequest;
      axios({
        method: "get",
        url: downloadLink,
        responseType: "stream",
        // responseType: "arraybuffer", // TODO: Currently S3 expects arraybuffer, GDrive expects steam lol
      }).then(async (res) => {
        try {
          // Upload to GDrive
          await this.StorageGoogleDrive.uploadMediaFile(
            googleDriveAccessToken,
            email,
            googleFolderId,
            fileName,
            res.data
          );

          // log.success(`Successfully downloaded ${fileName}`);
          resolve("done");
        } catch (err) {
          log.error(`Error while downloading ${fileName} for ${email}: ${err}`);
          await this.Memories.incrementMemoryStatusOnUser(email, "FAILED");
          reject(err);
        }
      });
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
