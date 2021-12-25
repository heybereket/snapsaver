import { FastifyPluginCallback } from "fastify";
import * as z from "zod";
import ss from "../lib/snapsaver";

const SnapSaver = new ss();

// TODO: Queueing for downloads?
const routes: FastifyPluginCallback = async (fastify) => {
  fastify.get("/ping", async (req, res) => {
    await res.send({ message: "pong" });
  });

  fastify.post("/upload/memories", async (req: any, res) => {
    const options = { limits: { fileSize: 1000 } };
    const data = await req.file(options)
    SnapSaver.uploadMemoriesJson(data)

    await res.send({ message: "done" });
  })

  fastify.get("/download/memories", async (req, res) => {
    const fileContents = SnapSaver.getMemoriesJson();
    SnapSaver.downloadAllMemories();

    await res.send({
      data: fileContents,
      isMemoriesJsonValid: SnapSaver.validateMemoriesJson(fileContents)
    });
  })

  fastify.post("/download/file", async (req, res) => {
    const schema = z.object({
      link: z.string(),
    });

    const { link } = schema.parse(req.body);

    SnapSaver.downloadMemoryFile(link, "images", "test.mp4");

    await res.send({
      success: true,
      message: link,
    });
  });
};

export default routes;
