import { FastifyPluginCallback } from "fastify";
import fastifyPassport from "fastify-passport";

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
      res.send({
          success: true,
          message: "Successfully authenticated with Google",
      })
    }
  );
};

export default googleCallback;
