import axios from "axios";
import * as z from "zod";
import memories from "./memories";
import storage, { FILE_TYPE } from "./storage";
import util from "./util";
import { Memory, Type } from "@prisma/client";
import { URL } from "url";

interface ISnapSaver {
  Memories: any;
  Storage: any;
  uploadMemoriesJson: (data: any, email: string) => Promise<[boolean, any]>;
  getMemoriesJson: (email: string, local: boolean) => void;
  filterMemories: (memories: any, startDate: Date, endDate: Date) => void;
  downloadMemories: (email: string, startDate: string, endDate: string) => void;
  isMemoriesJsonAvailable: (email: string) => Promise<boolean>;
  isZipAvailable: (email: string) => Promise<boolean>;
  getZipDownloadLink: (email: string) => Promise<string>;
  getMemoriesDownloadLinks: (email: string) => Promise<Array<string>>;
}

type MemoryRequest = {
  id: number;
  email: string;
  downloadLink: string;
  fileName: string;
};

class SnapSaver implements ISnapSaver {
  Memories: any;
  Storage: any;

  constructor() {
    this.Memories = new memories();
    this.Storage = new storage();
  }

  /**
   * 1. Validates the provided memories_history.json. If valid:
   * 2. Uploads the file to S3
   * 3. Processes file by adding an entry for each link to database
   * @param {any} data
   * @param {string} email
   */
  public uploadMemoriesJson = async (
    data: any,
    email: string
  ): Promise<[boolean, any]> => {
    let isValid = false;
    try {
      const buffer = Buffer.isBuffer(data) ? data : await data.toBuffer();
      const memoriesJson: JSON = util.bufferToJson(buffer);
      const fileName = "memories_history.json";

      this.validateMemoriesJson(memoriesJson);
      isValid = true;
      this.processMemoriesJson(email, memoriesJson);

      memoriesJson["Saved Media"].forEach((memory) => {
        const downloadLink = new URL(memory["Download Link"]);

        if (!(downloadLink.hostname == "app.snapchat.com")) {
          isValid = false;
        } else {
          this.Storage.uploadDataToS3(
            buffer,
            fileName,
            email,
            FILE_TYPE.REGULAR
          );
        }
      });

      return [isValid, memoriesJson];
    } catch (err) {
      console.error(`Error uploading memories JSON`, err);
      return [isValid, err];
    }
  };

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

    return await this.Storage.getMemoriesJsonFromS3(email);
  };

  /**
   * @param {any} memories
   * @param {Date} startDate
   * @param {Date} endDate
   */
  public filterMemories = async (
    memories: Memory[],
    startDate: Date,
    endDate: Date
  ) => {
    if (
      String(startDate) == "Invalid Date" &&
      String(endDate) == "Invalid Date"
    ) {
      return memories;
    } else {
      return memories.filter((memory: Memory) => {
        const date = new Date(memory.date);
        return date >= startDate && date <= endDate;
      });
    }
  };

  /**
   * Downloads (in parallel) all memories that are PENDING download from Snapchat and saves them to S3
   *
   * TODO: Add meta data to image/video so it can be filtered by date in file managers
   * TODO: Finalize naming scheme for files
   * TODO: Resuming downloads if failed midway
   */
  public downloadMemories = async (
    email: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      const memories: Array<Memory> = await this.Memories.getPendingMemories(
        email
      );
      const filteredMemories = await this.filterMemories(
        memories,
        new Date(startDate),
        new Date(endDate)
      );
      const memoryRequests: Array<object> = filteredMemories.map(
        (memory: Memory): MemoryRequest => {
          return {
            id: memory.id,
            email: memory.email,
            fileName: this.getMediaFileName(memory.date, memory.type),
            downloadLink: memory.downloadLink,
          };
        }
      );

      // Wait for all downloads to be resolved
      Promise.all(memoryRequests.map(this.requestAsync));
    } catch (err) {
      console.error(err);
    }

    return memories;
  };

  /**
   * Returns whether memories_history.json exists for user
   */
  public isMemoriesJsonAvailable = async (email: string): Promise<boolean> => {
    const fileKey = this.Storage.getPathS3(
      email,
      FILE_TYPE.REGULAR,
      "memories_history.json"
    );
    return await this.Storage.objectExistsInS3(fileKey);
  };

  /**
   * Returns whether memories.zip exists for user
   */
  public isZipAvailable = async (email: string): Promise<boolean> => {
    const fileKey = this.Storage.getPathS3(
      email,
      FILE_TYPE.REGULAR,
      "memories.zip"
    );
    return await this.Storage.objectExistsInS3(fileKey);
  };

  /**
   * Returns link to download memories.zip directly from S3
   */
  public getZipDownloadLink = async (email: string): Promise<string> => {
    const fileKey = this.Storage.getPathS3(
      email,
      FILE_TYPE.REGULAR,
      "memories.zip"
    );
    return await this.Storage.getSignedDownloadLinkS3(fileKey);
  };

  /**
   * Creates a Zip directory of users memories, if any files available.
   */
  public zipMemories = async (email: string): Promise<string> => {
    // Get list of files in users memory directory
    const dir = this.Storage.getPathS3(email, FILE_TYPE.MEMORY);
    const objects = await this.Storage.getObjectsInS3Directory(dir);

    if (objects["Contents"]?.length == 0) return "no files found";

    this.startZipMemories(email, objects);
    return "started";
  };

  /**
   * Returns list of URLs to download all memories media from S3 for user by email
   */
  public getMemoriesDownloadLinks = async (
    email: string
  ): Promise<Array<string>> => {
    const dir = this.Storage.getPathS3(email, FILE_TYPE.MEMORY);
    const objects = await this.Storage.getObjectsInS3Directory(dir);

    // Wait for all links to be resolved
    return Promise.all(
      objects["Contents"]?.map(async (object: any): Promise<string> => {
        return await this.Storage.getSignedDownloadLinkS3(object["Key"] || "");
      })
    );
  };

  /**
   * Checks if provided object matches the schema of a valid memories_history.json file
   * @param {json} any
   * @throws {Error}
   */
  private validateMemoriesJson = (json: any) => {
    const schema = z.object({
      "Saved Media": z.array(
        z.object({
          Date: z.string(),
          "Media Type": z.enum(["PHOTO", "VIDEO"]),
          "Download Link": z.string(),
        })
      ),
    });

    schema.parse(json);
  };

  /**
   * Adds each link in memories_history.json to Postgres
   */
  private processMemoriesJson = async (email: string, json: JSON) => {
    // Extracts image URL from Snapchat's link
    const getDownloadLinkFromSnapchat = async (url: string) => {
      const res = await axios({
        method: "post",
        url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return res.data;
    };

    const memories = json["Saved Media"] as Array<any>;

    memories.forEach(async (memory: any) => {
      const snapchatLink = memory["Download Link"];
      const downloadLink = await getDownloadLinkFromSnapchat(snapchatLink);
      this.Memories.addOrUpdateMemory(
        email,
        memory["Date"],
        memory["Media Type"],
        snapchatLink,
        downloadLink
      );
    });
  };

  /**
   * Asynchronously download the actual image/video file for this memory and save it to S3
   */
  private requestAsync = (memoryRequest: MemoryRequest) => {
    return new Promise((resolve, reject) => {
      const { id, email, downloadLink, fileName } = memoryRequest;
      axios({
        method: "get",
        url: downloadLink,
        responseType: "arraybuffer",
      }).then((res) => {
        try {
          const buffer = Buffer.from(res.data, "binary");
          this.Storage.uploadDataToS3(
            buffer,
            fileName,
            email,
            FILE_TYPE.MEMORY,
            id
          );
          console.log(`Successfully downloaded ${fileName}`);
          resolve("done");
        } catch (err) {
          console.error(`Error while downloading ${fileName}: ${err}`);
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
    objects: Array<any>
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
          this.Storage.downloadFileFromS3(downloadDir, fileKey);
        });

        // Create compressed ZIP file and uplaod to S3
        const zipDir = util.createDirIfNotExists("./temp/zips/" + email);
        const zipPath = zipDir + "/memories.zip";
        const zipBuffer: Buffer | undefined = await util.zipDirectory(
          downloadDir,
          zipPath
        );
        if (zipBuffer)
          this.Storage.uploadDataToS3(
            zipBuffer,
            "memories.zip",
            email,
            FILE_TYPE.REGULAR
          );
        // deleteDir(downloadDir)
        resolve();
      } catch (err) {
        console.error(`Error zipping memories`, err);
        reject();
      }
    });
  };

  /**
   * Returns file name with appropriate extension
   */
  private getMediaFileName = (date: Date, type: Type): string => {
    return `${date}${type == "PHOTO" ? ".jpg" : ".mp4"}`.replaceAll(":", "-");
  };
}

export default SnapSaver;
