import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import { MEGABYTE } from "../../lib/constants";
import ss, { StorageProvider } from "../../lib/snapsaver";
import memories from "../../lib/memories";

const SnapSaver = new ss();
const Memories = new memories();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.post(
    "/upload",
    { preHandler: [authenticateUser] },
    async (req, res) => {
      const { email, googleAccessToken } = req;
      const options = { limits: { fileSize: 8 * MEGABYTE } };
      const data = await req.file(options);

      const [isValid, result] = await SnapSaver.uploadMemoriesJson(data, email as string, StorageProvider.GOOGLE, googleAccessToken);
      const numMemories = isValid ? result["Saved Media"]?.length : 0;

      await Memories.createOrUpdateUser(email as string, numMemories);
      await res.send({ isValid, numMemories, email });
    }
  );

  fastify.post(
    "/upload/s3",
    { preHandler: [authenticateUser] },
    async (req, res) => {
      const options = { limits: { fileSize: 8 * MEGABYTE } };
      const data = await req.file(options);
      const { email } = req;
      const [isValid, result] = await SnapSaver.uploadMemoriesJson(data, email as string, StorageProvider.S3);
      const numMemories = isValid ? result["Saved Media"]?.length : 0;

      await res.send({ isValid, numMemories, email, result });
    }
  );

  done();
};
