import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/status",
    { preHandler: [authenticateUser] },
    async (req: any, res) => {
      await res.send({
        ready: await SnapSaver.isZipAvailable(req.email),
      });
    }
  );

  done();
};
