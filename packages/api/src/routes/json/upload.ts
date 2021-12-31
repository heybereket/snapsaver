import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import { MEGABYTE } from "../../lib/constants";
import ss from "../../lib/snapsaver";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.post(
    "/upload",
    { preHandler: [authenticateUser] },
    async (req: any, res) => {
      const options = { limits: { fileSize: 8 * MEGABYTE } };
      const data = await req.file(options);
      const email = req.email;
      const [isValid, result] = await SnapSaver.uploadMemoriesJson(data, email);
      const numMemories = isValid ? result["Saved Media"]?.length : 0;

      await res.send({ isValid, numMemories, email, result });
    }
  );

  done();
};
