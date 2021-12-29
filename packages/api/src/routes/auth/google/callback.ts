import { FastifyInstance } from "fastify";
import fastifyPassport from "fastify-passport";
import { CLIENT_URL } from "../../../lib/constants";

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/callback",
    {
      preValidation: fastifyPassport.authenticate("google", {
        scope: ["https://www.googleapis.com/auth/userinfo.email"],
        session: true,
      }),
    },
    async (req, res) => {
      res.redirect(CLIENT_URL);
    }
  );

  done();
};
