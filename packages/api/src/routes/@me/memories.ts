import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import memories from "../../lib/memories";

const Memories = new memories();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/memories",
    { preHandler: [authenticateUser] },
    async (req, res) => {
      const email = req.email;
      const memories = await Memories.getAllMemories(email as string);

      await res.send({
        email,
        memories,
      });
    }
  );

  done();
};
