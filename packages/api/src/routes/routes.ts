import { FastifyPluginCallback } from "fastify";

const fs = require("fs");
const request = require("request");
const path = require("path");

const downloadThis = (uri: string, dir: string, fileName: string) => {
  // TODO: Check if file already exists

  new Promise<void>((resolve, reject) => {
    // Make direcotry if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join('./', dir, fileName)

    request.post({
      uri,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .pipe(fs.createWriteStream(filePath))
    .on('finish', () => {
        console.log(`The file is finished downloading: ${fileName}.`);
        resolve();
    })
    .on('error', (error) => {
        reject(error);
    })
  })
  .catch(error => {
    console.log(`Something happened while downloading ${fileName}: ${error}`);
  });
}

// TODO: Queueing for downloads?
const hi: FastifyPluginCallback = async (fastify) => {
  fastify.get("/ping", async (req, res) => {
    await res.send({
      success: true,
      message: "pong",
    });
  });

  // TODO: Switch from GET to POST
  fastify.get("/download", async (req: any, res) => {
    const { link } = req.query

    await downloadThis(link, 'images', 'test.jpg')

    await res.send({
      success: true,
      message: link,
    });
  });
};

export default hi;
