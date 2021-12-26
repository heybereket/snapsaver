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
  fastify.get("/local/file/upload", async (req: any, res) => {
    SnapSaver.uploadMemoriesJsonLocal();
    await res.send({ message: "done" });
  });

  fastify.post("/file/upload", async (req: any, res) => {
    const options = { limits: { fileSize: 1000 } };
    const data = await req.file(options);
    SnapSaver.uploadMemoriesJson(data, req.user.emails?.values()?.next()?.value.value);

    await res.send({ message: "done" });
  });

  fastify.get("/memories/download", async (req: any, res) => {
    const email = req?.user?.emails?.values()?.next()?.value.value ?? SnapSaver.getDevUserEmail();
    const { memories } = await SnapSaver.downloadAllMemories(email);

    await res.send({
      data: memories,
      isMemoriesJsonValid: SnapSaver.validateMemoriesJson(memories),
    });
  });

  fastify.post("/media/download", async (req: any, res) => {
    const schema = z.object({
      link: z.string(),
    });

    const { link } = schema.parse(req.body);
    const email = req?.user?.emails?.values()?.next()?.value.value ?? SnapSaver.getDevUserEmail();

    SnapSaver.downloadFileFromSnapchat(link, "images", "test.mp4", email);

    await res.send({
      success: true,
      message: link,
    });
  });

  fastify.get("/s3/files", async (req, res) => {
    // const url = await SnapSaver.getS3DownloadLink();
    const urls = await SnapSaver.getMemoriesDownloadLinks();

    await res.send({
      urls,
    });
  })

  // TODO: Fix the endpoint convention
  fastify.get("/memories/zip", async (req, res) => {
    const message = await SnapSaver.startZipMemories()

    await res.send({
      message,
    });
  })
};

export default routes;
