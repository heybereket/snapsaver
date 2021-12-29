import { FastifyInstance } from "fastify";

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/@me", async (req, res) => {
    res.send({
      success: true,
      data: req.user,
    });
  });

  done();
};
