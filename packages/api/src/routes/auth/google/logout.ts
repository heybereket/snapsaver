import { FastifyInstance } from "fastify";
import { IS_PRODUCTION, CLIENT_URL, COOKIE_NAME } from "../../../lib/constants";

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/logout", async (req, res) => {
    await res
      .setCookie(COOKIE_NAME, "", {
        httpOnly: true,
        secure: IS_PRODUCTION,
        path: "/",
        sameSite: "strict",
        expires: new Date(),
      })
      .redirect(CLIENT_URL);
  });

  done();
};
