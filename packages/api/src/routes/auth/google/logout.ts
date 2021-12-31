import { FastifyInstance } from "fastify";

export default (fastify: FastifyInstance, opts, done) => {
  // fastify.get("/logout", async (req, res) => {
  //   req.logout();
  //   res.send({
  //     success: true,
  //     message: "Successfully logged out",
  //   });
  // });

  done();
};
