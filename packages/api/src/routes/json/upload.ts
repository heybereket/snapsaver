import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import { MEGABYTE } from "../../lib/constants";
import ss, { StorageProvider } from "../../lib/snapsaver";

const SnapSaver = new ss();

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

      await res.send({ isValid, numMemories, email, result });
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
