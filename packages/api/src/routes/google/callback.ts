import { FastifyPluginCallback } from "fastify";
import fastifyPassport from "fastify-passport";
import { CLIENT_URL } from "../../lib/constants";

const googleCallback: FastifyPluginCallback = async (fastify) => {
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
};

export default googleCallback;
