import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";
import util from "../../lib/util";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/status",
    { preHandler: [authenticateUser] },
    async (req: any, res) => {
      const email = util.getUserEmail(req);

      await res.send({
        ready: await SnapSaver.isZipAvailable(email),
      });
    }
  );

  done();
};
