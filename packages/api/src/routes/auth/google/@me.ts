import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../../lib/auth/session";
import { prisma } from "../../../lib/connections/prisma";

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/@me", { preHandler: [authenticateUser] }, async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { email: req.email as string },
    });

    if (!user?.betaUser || !user) {
      res.send({
        success: false,
        message: !user
          ? `You aren't a beta user...yet. Sign up for the waitlist.`
          : `You're not approved for beta yet! Soon...`,
        user: await authenticateUser(req, res),
      });
    }

    res.send({
      success: true,
      user,
    });
  });

  done();
};
