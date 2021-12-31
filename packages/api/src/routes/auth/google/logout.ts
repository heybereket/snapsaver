import { FastifyInstance } from "fastify";

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/logout", async (req, res) => {
    res.setCookie("snapsaver-token", "",{
      expires: Date.now() as unknown as Date,
    });

    res.send({
      success: true,
      message: "Successfully logged out",
    });
  });

  done();
};
