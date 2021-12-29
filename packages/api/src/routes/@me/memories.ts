import { FastifyInstance } from "fastify";
import { getSession } from "../../lib/auth/session";
import memories from "../../lib/memories";
import util from "../../lib/util";

const Memories = new memories();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/memories", async (req: any, res) => {
    const session = await getSession(req, res);
    if (!session) return;

    const email = util.getUserEmail(req);
    const memories = await Memories.getAllMemories(email);

    await res.send({
      email,
      memories,
    });
  });

  done();
};
