import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";
import { IS_PRODUCTION } from "./constants";
import * as log from "../lib/log";

const util = {
  getAbsolutePathLocal: (dir: string, fileName: string): string => {
    const relativePath = path.join("./", dir, fileName);
    return path.resolve(relativePath);
  },

  createDirIfNotExists: (dir: string): string => {
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  },

  deleteDir: (dir: string) => fs.rmdirSync(dir, { recursive: true }),

  getLocalFileAsBuffer: async (
    filePath: string
  ): Promise<Buffer | undefined> => {
    try {
      return await fsPromises.readFile(filePath);
    } catch (err) {
      log.error(`Error reading local file ${filePath}`, err);
    }
  },

  bufferToJson: (buffer: Buffer | undefined): JSON =>
    JSON.parse(buffer?.toString() ?? ""),

  zipDirectory: async (
    zipInputDirPath: string,
    zipOutputFilePath: string
  ): Promise<Buffer | undefined> => {
    try {
      const zip = new AdmZip();
      zip.addLocalFolder(zipInputDirPath);
      zip.writeZip(zipOutputFilePath);
      log.success(`Created ${zipOutputFilePath} successfully`);
      const absolutePath = path.resolve(zipOutputFilePath);
      return await util.getLocalFileAsBuffer(absolutePath);
    } catch (err) {
      log.error(`Error zipping directory ${zipInputDirPath}`, err);
    }
  },

  sliceIntoChunks: (arr: any[], chunkSize: number) => {
    const res: any[] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
    }
    return res;
  },
};

export default util;
