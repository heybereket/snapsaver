import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import memories from "../../lib/memories";
import util from "../../lib/util";

const Memories = new memories();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/memories",
    { preHandler: [authenticateUser] },
    async (req: any, res) => {
      const email = util.getUserEmail(req);
      const memories = await Memories.getAllMemories(email);

      await res.send({
        email,
        memories,
      });
    }
  );

  done();
};
