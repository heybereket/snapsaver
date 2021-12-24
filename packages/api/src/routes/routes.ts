import { FastifyPluginCallback } from "fastify";
import fs from "fs";
import axios from "axios";
import path from "path";
import * as z from "zod";

const schema = z.object({
  link: z.string(),
});

const downloadMemoryFile = (url: string, dir: string, fileName: string) => {
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

const downloadMemory = (url: string, dir: string, fileName: string) => {
  new Promise<void>((resolve, reject) => {
    axios({
      method: "post",
      url,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then((res) => {
      const memoryURL = res.data;
      downloadMemoryFile(memoryURL, dir, fileName);
    });
  });
};

// TODO: Queueing for downloads?
const routes: FastifyPluginCallback = async (fastify) => {
  fastify.get("/ping", async (req, res) => {
    await res.send({
      success: true,
      message: "pong",
    });
  });

  fastify.post("/download", async (req, res) => {
    const { link } = schema.parse(req.body);

    downloadMemory(link, "images", "test.mp4");

    await res.send({
      success: true,
      message: link,
    });
  });
};

export default routes;
