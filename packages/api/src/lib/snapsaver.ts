import path from "path";
import axios from "axios";
import fs from "fs";
import pump from "pump";
import * as z from "zod";
import { S3 } from "./connections/aws";
import { IS_PRODUCTION } from "./constants";

enum FILE_TYPE {
  "MEMORY",
  "JSON",
}

class SnapSaver {
  constructor() {}

  getMemoriesJsonLocal = () => {
    // TODO: Split this up to local (from file system) and production (from S3)
    const filePath = this.getAbsolutePath("data", "memories_history.json");
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

  // TODO: Move to util
  getAbsolutePath = (dir, fileName) => {
    const relativePath = path.join("./", dir, fileName);
    return path.resolve(relativePath);
  };

  getUserEmail = () => {
    // TODO: Add OAuth
    return IS_PRODUCTION
      ? "asemagn@gmail.com"
      : (process.env.DEV_USER_EMAIL as string);
  };

  uploadMemoriesJsonLocal = async () => {
    const fileName = "memories_history.json";

    this.uploadLocalFileToS3(
      this.getAbsolutePath("data", fileName),
      fileName,
      this.getUserEmail(),
      FILE_TYPE.JSON
    );
  };

  uploadMemoriesJson = async (data: any, email: string) => {
    const buffer = await data.toBuffer();

    this.uploadFileToS3(
      buffer,
      "memories_history.json",
      email,
      FILE_TYPE.JSON
    );
  };

  downloadMemoryLink = (url: string, dir: string, fileName: string) => {
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
        try {
          return new Promise<void>((resolve, reject) => {
            // TODO: How to efficiently do this? Temporarily save file til it's uploaded to S3?
            res.data.pipe(writer);
            writer.on("finish", () => {
              console.log(`The file is finished downloading: ${fileName}.`);

              this.uploadFileToS3(
                this.getAbsolutePath("images", fileName),
                fileName,
                this.getUserEmail(),
                FILE_TYPE.MEMORY
              );

              resolve();
            });
            writer.on("error", (error) => {
              reject(error);
            });
          });
        } catch (error_1) {
          console.log(
            `Something happened while downloading ${fileName}: ${error_1}`
          );
        }
      });
    });
  };

  getS3FileDir = (email: string, type: FILE_TYPE) => {
    return (
      "users" + "/" + email + (type == FILE_TYPE.MEMORY ? "/memories" : "")
    );
  };

  getMemoriesJsonFromS3 = async () => {
    const fileDir = this.getS3FileDir(this.getUserEmail(), FILE_TYPE.JSON);
    const s3FilePath = fileDir + "/memories_history.json";

    const options = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: s3FilePath,
      // ResponseContentType : 'application/json'
    };

    try {
      const data = await S3.getObject(options).promise();
      const fileContents = data.Body?.toString();
      return fileContents ? JSON.parse(fileContents) : null;
    } catch (err) {
      console.error(err);
    }
  };

  uploadLocalFileToS3 = (localFilePath: string, fileName: string, email: string, type: FILE_TYPE) => {
    fs.readFile(localFilePath, async (err, data) => {
      if (err) throw err;

      this.uploadFileToS3(data, fileName, email, type)
    });
  }

  uploadFileToS3 = async (
    data: any,
    fileName: string,
    email: string,
    type: FILE_TYPE
  ) => {
    const fileDir = this.getS3FileDir(email, type);
    const s3FilePath = fileDir + "/" + fileName;

    // TODO: Re-evaluate security of S3
    const options = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: s3FilePath,
      Body: data,
    };

    S3.upload(options, (s3Err, data) => {
      if (s3Err) throw s3Err;
      console.log(`File uploaded to S3 successfully: ${data.Location}`);
    });
  };

  downloadAllMemories = async () => {
    // TODO: Check if file exists
    const memories = await this.getMemoriesJsonFromS3();

    memories["Saved Media"].forEach((memory) => {
      const url = memory["Download Link"];
      const dir = "images";
      const fileName = `${memory["Date"]}${
        memory["Media Type"] == "PHOTO" ? ".jpg" : ".mp4"
      }`;

      this.downloadMemoryLink(url, dir, fileName.replaceAll(":", "-"));
    });

    return { memories };
  };
}

export default SnapSaver;
