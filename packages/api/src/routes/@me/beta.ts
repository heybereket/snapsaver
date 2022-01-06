import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import { prisma } from "../../lib/connections/prisma";

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/beta", { preHandler: [authenticateUser] }, async (req, res) => {
    const user = await prisma.user.upsert({
      where: { email: req.email as string },
      create: {
        email: req.email as string,
        betaUser: true,
      },
      update: {
        email: req.email as string,
        betaUser: true,
      },
    });

    if (user) {
      await res.send({
        success: true,
        message: "Approved beta.",
      });
    }
  });

  done();
};
