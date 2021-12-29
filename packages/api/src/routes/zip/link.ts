import { FastifyInstance } from "fastify";
import { getSession } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";
import util from "../../lib/util";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/link", async (req: any, res) => {
    const session = await getSession(req, res);
    if (!session) return;

    const email = util.getUserEmail(req);
    const link = await SnapSaver.getZipDownloadLink(email);

    await res.send({
      link,
    });
  });

  done();
};