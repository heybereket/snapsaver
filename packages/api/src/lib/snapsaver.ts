import path from "path";
import axios from "axios";
import fs from "fs";
import pump from "pump";
import * as z from "zod";

class SnapSaver {
  constructor() {}

  getMemoriesJson = () => {
    // TODO: Split this up to local (from file system) and production (from S3)
    const filePath =
      "/workspaces/snapsaver/packages/api/data/memories_history.json";
    return require(filePath);
  };

  validateMemoriesJson = (json: any) => {
    try {
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
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  uploadMemoriesJson = async (data: any) => {
    const dir = "images";
    const fileName = "test.json";
    const filePath = path.join("./", dir, fileName);
    const writer = fs.createWriteStream(filePath);

    await pump(data.file, writer);
  };

  getMemoryDownloadLink = (url: string, dir: string, fileName: string) => {
    new Promise<void>((resolve, reject) => {
      axios({
        method: "post",
        url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }).then((res) => {
        const memoryURL = res.data;
        this.downloadMemoryFile(memoryURL, dir, fileName);
      });
    });
  };

  // TODO: Add meta data to image? So it can be filtered by date
  // TODO: Decide naming scheme for files
  // TODO: What to do if memories download fails midway
  downloadMemoryFile = (url: string, dir: string, fileName: string) => {
    // TODO: Check if file already exists

    new Promise<void>((resolve, reject) => {
      // Make direcotry if it doesn't exist
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join("./", dir, fileName);
      const writer = fs.createWriteStream(filePath);

      axios({
        method: "get",
        url,
        responseType: "stream",
      }).then((res) => {
        return new Promise<void>((resolve, reject) => {
          res.data.pipe(writer);
          writer.on("finish", () => {
            console.log(`The file is finished downloading: ${fileName}.`);
            resolve();
          });
          writer.on("error", (error) => {
            reject(error);
          });
        }).catch((error) => {
          console.log(
            `Something happened while downloading ${fileName}: ${error}`
          );
        });
      });
    });
  };

  uploadFileToS3 = () => {};

  downloadAllMemories = () => {
    const memories = this.getMemoriesJson();

    memories["Saved Media"].forEach((memory) => {
      const url = memory["Download Link"];
      const dir = "images";
      const fileName = `${memory["Date"]}.${
        memory["Media Type"] == "PHOTO" ? ".jpg" : ".mp4"
      }`;

      this.downloadMemoryFile(url, dir, fileName);
    });
  };
}

export default SnapSaver;
