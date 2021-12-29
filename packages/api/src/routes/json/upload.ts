import { FastifyInstance } from "fastify";
import { getSession } from "../../lib/auth/session";
import { MEGABYTE } from "../../lib/constants";
import ss from "../../lib/snapsaver";
import util from "../../lib/util";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.post("/upload", async (req: any, res) => {
    const session = await getSession(req, res);
    if (!session) return;

    const options = { limits: { fileSize: 8 * MEGABYTE } };
    const data = await req.file(options);
    const email = util.getUserEmail(req);
    const [isValid, result] = await SnapSaver.uploadMemoriesJson(data, email);
    const numMemories = isValid ? result["Saved Media"]?.length : 0;

    await res.send({ isValid, numMemories, email, result });
  });

  done();
};
