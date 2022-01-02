import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../../lib/auth/session";

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/@me", async (req, res) => {
    const user = await authenticateUser(req, res);

    res.send({
      success: true,
      user,
    });
  });

  done();
};
