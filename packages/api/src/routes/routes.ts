import { FastifyPluginCallback } from "fastify";
import ss from "../lib/snapsaver";
import memories from "../lib/memories";
import util from "../lib/util";
import * as z from "zod";

// TODO: Queueing for downloads?
const routes: FastifyPluginCallback = async (fastify) => {
  const SnapSaver = new ss();
  const Memories = new memories();

  fastify.get("/ping", async (req, res) => {
    await res.send({ message: "pong" });
  });

  // Made GET as testing POST request ain't working on iPad
  fastify.get("/local/json/upload", async (req: any, res) => {
    const filePath = util.getAbsolutePathLocal("data", "memories_history.json");
    const buffer = await util.getLocalFileAsBuffer(filePath);
    const email = util.getUserEmail(req);
    const [isValid, result] = await SnapSaver.uploadMemoriesJson(buffer, email);
    const numMemories = isValid ? result["Saved Media"]?.length : 0;

    await res.send({ isValid, numMemories, email, result });
  });

  fastify.post("/json/upload", async (req: any, res) => {
    // TODO: Evaludate fileSize
    const MEGABYTE = 1000000;
    const options = { limits: { fileSize: 8 * MEGABYTE } };
    const data = await req.file(options);
    const email = util.getUserEmail(req);
    const [isValid, result] = await SnapSaver.uploadMemoriesJson(data, email);
    const numMemories = isValid ? result["Saved Media"]?.length : 0;

    await res.send({ isValid, numMemories, email, result });
  });

  // Returns if memories_history.json exists for the user
  fastify.get("/json/status", async (req: any, res) => {
    const email = util.getUserEmail(req);

    await res.send({
      ready: await SnapSaver.isMemoriesJsonAvailable(email),
    });
  });

  fastify.post("/memories/download", async (req: any, res) => {
    const email = util.getUserEmail(req);
    const schema = z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    });
    const { startDate, endDate } = schema.parse(req.body);
    SnapSaver.downloadMemories(email, startDate as string, endDate as string);

    await res.send({
      message: "started",
    });
  });

  fastify.get("/memories/links", async (req, res) => {
    const email = util.getUserEmail(req);
    const urls = await SnapSaver.getMemoriesDownloadLinks(email);

    await res.send({
      urls,
    });
  });

  // TODO: Fix the endpoint convention
  fastify.get("/memories/zip", async (req: any, res) => {
    const email = util.getUserEmail(req);
    const message = await SnapSaver.zipMemories(email);

    await res.send({
      message,
    });
  });

  fastify.get("/zip/link", async (req: any, res) => {
    const email = util.getUserEmail(req);
    const link = await SnapSaver.getZipDownloadLink(email);

    await res.send({
      link,
    });
  });

  // Returns if memories.zip exists for the user
  fastify.get("/zip/status", async (req: any, res) => {
    const email = util.getUserEmail(req);

    await res.send({
      ready: await SnapSaver.isZipAvailable(email),
    });
  });

  fastify.get("/user/memories", async (req: any, res) => {
    const email = util.getUserEmail(req);
    const memories = await Memories.getAllMemories(email);

    await res.send({
      email,
      memories,
    });
  });
};

export default routes;
