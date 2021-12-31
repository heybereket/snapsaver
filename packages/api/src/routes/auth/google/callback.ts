import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { CLIENT_URL, IS_PRODUCTION } from "../../../lib/constants";

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get("/callback", async (req, res) => {
    const token =
      await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

    res
      .setCookie("snapsaver-token", token.access_token, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        path: "/",
        sameSite: "strict",
        expires: dayjs().add(7, "days").toDate(),
      })
      .redirect(CLIENT_URL);
  });

  done();
};
