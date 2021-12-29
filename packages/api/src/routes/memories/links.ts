import { FastifyInstance } from "fastify";
import { getSession } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";
import util from "../../lib/util";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/links", async (req, res) => {
    const session = await getSession(req, res);
    if (!session) return;

    const email = util.getUserEmail(req);
    const urls = await SnapSaver.getMemoriesDownloadLinks(email);

    await res.send({
      urls,
    });
  });

  done();
};
