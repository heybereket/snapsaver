import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";
import util from "../../lib/util";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/links",
    { preHandler: [authenticateUser] },
    async (req, res) => {
      const email = util.getUserEmail(req);
      const urls = await SnapSaver.getMemoriesDownloadLinks(email);

      await res.send({
        urls,
      });
    }
  );

  done();
};
