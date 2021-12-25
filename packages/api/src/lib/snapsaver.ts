import path from "path";
import axios from "axios";
import fs from "fs";
import pump from "pump";
import * as z from "zod";
import aws from 'aws-sdk';

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

class SnapSaver {
  constructor() {}

  getMemoriesJson = () => {
    // TODO: Split this up to local (from file system) and production (from S3)
    const filePath = "/workspaces/snapsaver/packages/api/data/memories_history.json";
    // const filePath = "C:/Users/Owner/Documents/projects/snapsaver/packages/api/data/memories_history.json";
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

    pump(data.file, writer);
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
      }).then(async (res) => {
        try {
          return await new Promise<void>((resolve, reject) => {
            // TODO: How to efficiently do this? Temporarily save file til it's uploaded to S3?
            res.data.pipe(writer);
            writer.on("finish", () => {
              console.log(`The file is finished downloading: ${fileName}.`);

              // TODO: Upload files under directory by user email
              const userEmail = "asemagn@gmail.com";

              this.uploadFileToS3('/workspaces/snapsaver/packages/api/images/2021-12-23 18-45-16 UTC.mp4', fileName, userEmail);

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

  uploadFileToS3 = async (localFilePath: string, fileName: string, email: string) => {
    fs.readFile(localFilePath, async (err, data) => {
      if (err) throw err;
      const s3FilePath = path.join("./", "users", email, "memories", fileName);

      // TODO: Re-evaluate security of S3
      new aws.S3().upload({
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: s3FilePath,
        Body: data,
      }, (s3Err, data) => {
        if (s3Err) throw s3Err;
        console.log(`File uploaded to S3 successfully: ${data.Location}`);
      });
    });
  };

  downloadAllMemories = () => {
    const memories = this.getMemoriesJson();

    memories["Saved Media"].forEach((memory) => {
      const url = memory["Download Link"];
      const dir = "images";
      const fileName = `${memory["Date"]}${
        memory["Media Type"] == "PHOTO" ? ".jpg" : ".mp4"
      }`;

      this.downloadMemoryLink(url, dir, fileName.replaceAll(':', '-'));
    });
  };
}

export default SnapSaver;
