import path from "path";
import axios from "axios";
import fs from "fs";
import sharp from "sharp";
import * as z from "zod";
import { S3 } from "./connections/aws";
import { IS_PRODUCTION } from "./constants";
import archiver from "archiver";
import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";
import { createContext } from "vm";

enum FILE_TYPE {
  "MEMORY",
  "REGULAR",
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

  getDevUserEmail = () => {
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
      this.getDevUserEmail(),
      FILE_TYPE.REGULAR
    );
  };

  uploadMemoriesJson = async (data: any, email: string) => {
    const buffer = await data.toBuffer();

    this.uploadFileToS3(
      buffer,
      "memories_history.json",
      email,
      FILE_TYPE.REGULAR
    );
  };

  getDownloadLinkFromSnapchat = (
    url: string,
    dir: string,
    fileName: string,
    email: string,
    last?: boolean
  ) => {
    // new Promise<void>((resolve, reject) => {
      axios({
        method: "post",
        url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }).then((res) => {
        const memoryURL = res.data;
        this.downloadFileFromSnapchat(memoryURL, dir, fileName, email, last);
      });
    // });
  };

  // TODO: Add meta data to image? So it can be filtered by date
  // TODO: Decide naming scheme for files
  // TODO: What to do if memories download fails midway
  downloadFileFromSnapchat = (
    url: string,
    dir: string,
    fileName: string,
    email: string, 
    last?: boolean
  ) => {
    // TODO: Check if file already exists
      axios({
        method: "get",
        url,
        responseType: "arraybuffer",
      }).then((res) => {
        try {
          return new Promise<void>((resolve, reject) => {
            // TODO: How to efficiently do this? Temporarily save file til it's uploaded to S3?
            const buffer = Buffer.from(res.data, "binary");

            // this is so jank. passing a callback to download zip memories only if this file is the last one in the index of files being downloaded.
            // con (one of many): if there's a failure with the last file, may not make it to the point of zipping.
            const callback = last == true ? () => { this.startZipMemories(email) } : null;
            this.uploadFileToS3(buffer, fileName, email, FILE_TYPE.MEMORY, callback);
          });
        } catch (error_1) {
          console.log(
            `Something happened while downloading ${fileName}: ${error_1}`
          );
        }
      });
  };

  getS3FileDir = (email: string, type: FILE_TYPE) => {
    return (
      "users" + "/" + email + (type == FILE_TYPE.MEMORY ? "/memories" : "")
    );
  };

  getMemoriesJsonFromS3 = async (email: string) => {
    const fileDir = this.getS3FileDir(email, FILE_TYPE.REGULAR);
    const s3FilePath = fileDir + "/memories_history.json";

    const options = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: s3FilePath,
    };

    try {
      const data = await S3.getObject(options).promise();
      const fileContents = data.Body?.toString();
      return fileContents ? JSON.parse(fileContents) : null;
    } catch (err) {
      console.error(err);
    }
  };

  uploadLocalFileToS3 = (
    localFilePath: string,
    fileName: string,
    email: string,
    type: FILE_TYPE
  ) => {
    fs.readFile(localFilePath, async (err, data) => {
      if (err) throw err;

      this.uploadFileToS3(data, fileName, email, type);
    });
  };

  uploadFileToS3 = async (
    uploadData: any,
    fileName: string,
    email: string,
    type: FILE_TYPE,
    callback?: any
  ) => {
    const fileDir = this.getS3FileDir(email, type);
    const s3FilePath = fileDir + "/" + fileName;

    // TODO: Re-evaluate security of S3
    const options = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: s3FilePath,
      Body: uploadData,
    };

    S3.upload(options, (s3Err, data) => {
      if (s3Err) throw s3Err;
      console.log(`File uploaded to S3 successfully: ${data.Location}`);

      if (callback) callback()
    });
  };

  // This is getting outta hand (addis)
  iterateAndDownload = async (memories: any, email: any) => {
    memories["Saved Media"].forEach((memory, idx, array) => {
      const url = memory["Download Link"];
      const dir = "images";
      const fileName = `${memory["Date"]}${
        memory["Media Type"] == "PHOTO" ? ".jpg" : ".mp4"
      }`;

      this.getDownloadLinkFromSnapchat(
        url,
        dir,
        fileName.replaceAll(":", "-"),
        email,
        idx == array.length - 1 // last file
      );
    });
  }

  downloadAllMemories = async (email: string) => {
    // TODO: Check if file exists
    const memories = await this.getMemoriesJsonFromS3(email);

    await this.iterateAndDownload(memories , email);

    return { memories };
  };

  objectExistsInS3 = async (fileKey: string) => {
    try {
      const options = {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: fileKey,
      };

      await S3.headObject(options).promise()
      return true;
    } catch (err) {
      if (err.statusCode === 404) console.error(`File not found in S3: ${fileKey}`)

      return false;
    }
  }

  getS3DownloadLink = async (fileKey: string) => {
    try {
      if (!await this.objectExistsInS3(fileKey)) return null;

      const options = {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: fileKey,
      };

      const url = S3.getSignedUrl("getObject", options);
      return url;
    } catch (err) {
      console.error(err);
    }
  };

  isMemoriesJsonAvailable = async (email: string) => {
    const fileKey = this.getS3FileDir(email, FILE_TYPE.REGULAR) + "/memories_history.json";

    return await this.objectExistsInS3(fileKey);
  }

  isZipAvailable = async (email: string) => {
    const fileKey = this.getS3FileDir(email, FILE_TYPE.REGULAR) + "/memories.zip";

    return await this.objectExistsInS3(fileKey);
  }

  getZipDownloadLink = (email: string) => {
    const fileKey = this.getS3FileDir(email, FILE_TYPE.REGULAR) + "/memories.zip";

    return this.getS3DownloadLink(fileKey)
  }

  // List of URLs to download the files from S3
  getMemoriesDownloadLinks = async () => {
    const dir =
      this.getS3FileDir(this.getDevUserEmail(), FILE_TYPE.MEMORY) + "/";

    const options = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Prefix: dir,
    };

    // TODO: Handle not-found cases
    const objects = await S3.listObjectsV2(options).promise();
    return objects["Contents"]?.map((object) => {
      return this.getS3DownloadLink(object["Key"] || "");
    });
  };

  // TODO: This function is redudant rn but will use in re-factor
  startZipMemories = (email: string) => {
    return this.downloadAllFilesFromS3(email);
  };

  zipDirectory = (sourceDir: string, outPath: string) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = fs.createWriteStream(outPath);

    return new Promise<void>((resolve, reject) => {
      archive
        .directory(sourceDir, false)
        .on("error", (err) => reject(err))
        .pipe(stream);

      stream.on("close", () => resolve());
      archive.finalize();
    });
  };

  getObjectsInS3Directory = async () => {
    const s3Dir =
      this.getS3FileDir(this.getDevUserEmail(), FILE_TYPE.MEMORY) + "/";

    const options = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Prefix: s3Dir,
    };

    // TODO: Handle not-found cases
    return await S3.listObjectsV2(options).promise();
  };

  // Download a single file from S3
  downloadFileFromS3 = async (dir, fileKey) => {
    console.log("Trying to download file from S3", fileKey);

    const fileName = path.basename(fileKey);
    const destPath = dir + "/" + fileName;

    const readStream = S3.getObject({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: fileKey,
    }).createReadStream();

    const writeStream = fs.createWriteStream(destPath);
    readStream.pipe(writeStream);
  };

  // This just does it recurssively
  downloadAllFilesFromS3 = async (email: string) => {
    // Get list of files in users memory directory
    const objects = await this.getObjectsInS3Directory();
    if (objects["Contents"]?.length == 0) {
      return "no files found";
    }

    // Create directories for downloading memories and saving Zip file
    const downloadDir = "./temp/memories/" + email;
    fs.mkdirSync(downloadDir, { recursive: true });
    const zipDir = "./temp/zips/" + email;
    fs.mkdirSync(zipDir, { recursive: true });

    // Download each memory media
    // TODO: For now getting first 10 til we figure out disk challenge
    objects["Contents"]?.slice(0, 10).forEach(async (object) => {
      const fileKey = object["Key"] as string;
      this.downloadFileFromS3(downloadDir, fileKey);
    });

    // Post-processing
    const zipPath = zipDir + "/memories.zip";
    await this.zipDirectory(zipDir, zipPath);
    this.uploadLocalFileToS3(
      zipPath,
      "memories.zip",
      email,
      FILE_TYPE.REGULAR
    );
    // this.deleteDir(downloadDir)

    return "done";
  };

  deleteDir = (dir) => {
    fs.rmdirSync(dir, { recursive: true });
  };
}

export default SnapSaver;
