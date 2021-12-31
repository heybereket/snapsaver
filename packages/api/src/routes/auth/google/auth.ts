import { FastifyInstance } from "fastify";
import fastifyPassport from "fastify-passport";

export default (fastify: FastifyInstance, opts, done) => {
  // fastify.get(
  //   "/",
  //   fastifyPassport.authenticate("google", {
  //     scope: ["https://www.googleapis.com/auth/userinfo.email"],
  //   })
  // );

  // done();
};
