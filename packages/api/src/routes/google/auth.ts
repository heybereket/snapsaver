import { FastifyPluginCallback } from "fastify";
import fastifyPassport from "fastify-passport";

const googleAuth: FastifyPluginCallback = async (fastify) => {
  fastify.get(
    "/",
    fastifyPassport.authenticate("google", { scope: ["https://www.googleapis.com/auth/userinfo.email"] })
  );
};

export default googleAuth;
