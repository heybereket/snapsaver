import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import { prisma } from "../../lib/connections/prisma";
import memories from "../../lib/memories";

const Memories = new memories();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/beta", { preHandler: [authenticateUser] }, async (req, res) => {
    try {
      const user = await prisma.user.upsert({
        where: { email: req.email as string },
        create: {
          email: req.email as string,
        },
        update: {},
      });

      if (user) {
        await res.send({
          success: true,
          message: "Signed up for beta!",
        });
      }
    } catch {
      await res.send({
        success: false,
        message: "You are already a beta user!",
      });
    }
  });

  done();
};
