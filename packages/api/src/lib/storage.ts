import fs from "fs";
import path from "path";
import { S3 } from "./connections/aws";
import { S3_BUCKET } from "./constants";
import memories from "../lib/memories";

export enum FILE_TYPE {
  "MEMORY",
  "REGULAR",
}

interface IStorage {
  getPathS3: (email: string, type: FILE_TYPE, fileName?: string) => string;
  getMemoriesJsonFromS3: (email: string) => Promise<JSON | null | undefined>;
  uploadDataToS3: (data: any, fileName: string, email: string, type: FILE_TYPE) => void;
  getSignedDownloadLinkS3: (fileKey: string) => Promise<string | null | undefined>;
  objectExistsInS3: (fileKey: string) => Promise<boolean>;
  getObjectsInS3Directory: (dir: string) => Promise<any>; // TODO: Change any in return
};

class Storage implements IStorage {
  Memories: any;

  constructor() {
    this.Memories = new memories();
  }

  public getPathS3 = (email: string, type: FILE_TYPE, fileName?: string): string => {
    // Memory media files stored at: /users/<email>/memories/<fileName>
    // Other files stored at: /users/<email>/<fileName>
    return "".concat("users", "/", email, type == FILE_TYPE.MEMORY ? "/memories/" : "/", fileName ?? "");
  };

  public getMemoriesJsonFromS3 = async (email: string): Promise<JSON | null | undefined> => {
    const s3FilePath = this.getPathS3(email, FILE_TYPE.REGULAR, "memories_history.json");

    const options = {
      Bucket: S3_BUCKET,
      Key: s3FilePath,
    };

    try {
      const data = await S3.getObject(options).promise();
      const fileContents = data.Body?.toString();
      return fileContents ? JSON.parse(fileContents) : null;
    } catch (err) {
      console.error(`Error getting memories JSON from ${s3FilePath}`, err);
    }
  };

  public uploadDataToS3 = async (data: any, fileName: string, email: string, type: FILE_TYPE, memoryId?: number) => {
    const s3FilePath = this.getPathS3(email, type, fileName);

    // TODO: Re-evaluate security of S3
    const options = {
      Bucket: S3_BUCKET,
      Key: s3FilePath,
      Body: data,
    };

    try {
      S3.upload(options, (s3Err: any, s3Data: any) => {
        if (s3Err) throw s3Err;
        console.log(`File uploaded to S3 successfully: ${s3Data.Location}`);

        if (memoryId) {
          this.Memories.updateMemoryStatusSuccess(memoryId);
        }
      });
    } catch (err) {
      console.error(`Error uploading data to S3 by key ${s3FilePath}`, err);
    }
  };

  public getSignedDownloadLinkS3 = async (fileKey: string): Promise<string | null | undefined> => {
    try {
      if (!await this.objectExistsInS3(fileKey)) return null;

      const options = {
        Bucket: S3_BUCKET,
        Key: fileKey,
      };

      const url = S3.getSignedUrl("getObject", options);
      return url;
    } catch (err) {
      console.error(`Error getting signed URL for ${fileKey}`, err);
    }
  };

  public objectExistsInS3 = async (fileKey: string): Promise<boolean> => {
    try {
      const options = {
        Bucket: S3_BUCKET,
        Key: fileKey,
      };

      await S3.headObject(options).promise()
      return true;
    } catch (err) {
      if (err.statusCode === 404) console.error(`File not found in S3: ${fileKey}`)
      return false;
    }
  }

  public getObjectsInS3Directory = async (dir: string): Promise<any> => {
    try {
      const options = {
        Bucket: S3_BUCKET,
        Prefix: dir,
      };
      console.log("dir", dir)

      return await S3.listObjectsV2(options).promise();
    } catch (err) {
      console.error(`Error getting objects in directory ${dir}`, err);
    }
  };

  // Download a single file from S3
  public downloadFileFromS3 = async (dir: string, fileKey: string) => {
    try {
      console.log("Trying to download file from S3", fileKey);

      const fileName = path.basename(fileKey);
      const destPath = dir + "/" + fileName;

      const readStream = S3.getObject({
        Bucket: S3_BUCKET,
        Key: fileKey,
      }).createReadStream();

      const writeStream = fs.createWriteStream(destPath);
      readStream.pipe(writeStream);
    } catch (err) {
      console.error(`Error downloading file from S3 ${fileKey}`, err);
    }
  };
}

export default Storage;