import { FastifyPluginCallback } from "fastify";
import * as z from "zod";
import ss from "../lib/snapsaver";

const SnapSaver = new ss();

// TODO: Queueing for downloads?
const routes: FastifyPluginCallback = async (fastify) => {
  fastify.get("/ping", async (req, res) => {
    await res.send({ message: "pong" });
  });

  // Made GET as testing POST request ain't working on iPad
  fastify.get("/local/upload/file", async (req: any, res) => {
    SnapSaver.uploadMemoriesJsonLocal();
    await res.send({ message: "done" });
  });

  fastify.post("/upload/file", async (req: any, res) => {
    const options = { limits: { fileSize: 1000 } };
    const data = await req.file(options);
    SnapSaver.uploadMemoriesJson(data, req.user.emails?.values()?.next()?.value.value);

    await res.send({ message: "done" });
  });

  fastify.get("/download/memories", async (req, res) => {
    const { memories } = await SnapSaver.downloadAllMemories();

    await res.send({
      data: memories,
      isMemoriesJsonValid: SnapSaver.validateMemoriesJson(memories),
    });
  });

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
