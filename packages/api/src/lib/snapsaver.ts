import axios from "axios";
import * as z from "zod";
import memories from "./memories";
import storageGoogleDrive from "./storage/google-drive";
import util from "./util";
import { Status, Type } from "@prisma/client";
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
  validateMemoriesJson: (json: any) => { success: boolean; err: string };
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
        log.error(`Failed to process memories JSON, user not found - ${email}`);
        jobDoneCallback(null, { email, message: "user not found" });
        return;
      }

      const googleFileId = user.memoriesFileId;
      const googleFolderId = user.memoriesFolderId;

      if (!googleFileId || !googleFolderId) {
        jobDoneCallback(null, {
          email,
          message: "missing google file id or folder id",
        });
        return;
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

      const filteredMemories = this.filterMemories(
        memoriesToProcess,
        startDate,
        endDate,
        type
      );

      await prisma.user.update({
        where: { email },
        data: { memoriesTotal: filteredMemories.length },
      });

      // Wait for all downloads to be resolved
      let promises = filteredMemories.map((memory: any) => {
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
            // Temporarily storing error message for debugging
            await prisma.user.update({
              where: { email },
              data: {
                error: `${util.currentDateFormatted()} - Error extracting link from Snapchat.`,
              },
            });

            await this.Memories.incrementMemoryStatusOnUser(
              email,
              memoryRequest.status
            );
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

  public filterMemories = (memories, startDate, endDate, type) => {
    return memories.filter((memory: any) => {
      const date = new Date(memory["Date"]).setUTCHours(0, 0, 0, 0);
      const isInRange =
        !startDate ||
        !endDate ||
        (date >= new Date(startDate).setUTCHours(0, 0, 0, 0) &&
          date <= new Date(endDate).setUTCHours(23, 59, 59, 999));
      const isType = type === "ALL" || memory["Media Type"] === type;
      return isInRange && isType;
    });
  };

  /**
   * Checks if provided object matches the schema of a valid memories_history.json file
   * @param {json} any
   * @throws {Error}
   */
  public validateMemoriesJson = (
    json: any
  ): { success: boolean; err: string } => {
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
      return { success: true, err: "" };
    } catch (err) {
      log.error(err);
      return { success: false, err: err };
    }
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

          resolve("done");
        } catch (err) {
          log.error(`Error while downloading ${fileName} for ${email}: ${err}`);
          // Temporarily storing error message for debugging
          await prisma.user.update({
            where: { email },
            data: {
              error: `${util.currentDateFormatted()} - Error while downloading media link. ${err}`,
            },
          });
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
