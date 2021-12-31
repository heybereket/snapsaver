import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/links",
    { preHandler: [authenticateUser] },
    async (req, res) => {
      const urls = await SnapSaver.getMemoriesDownloadLinks(req.email);

      await res.send({
        urls,
      });
    }
  );

  done();
};
