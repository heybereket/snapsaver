import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/link",
    { preHandler: [authenticateUser] },
    async (req: any, res) => {
      const link = await SnapSaver.getZipDownloadLink(req.email);

      await res.send({
        link,
      });
    }
  );

  done();
};
