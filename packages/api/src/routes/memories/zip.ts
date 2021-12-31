import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/zip",
    { preHandler: [authenticateUser] },
    async (req: any, res) => {
      const message = await SnapSaver.zipMemories(req.email);

      await res.send({
        message,
      });
    }
  );

  done();
};
