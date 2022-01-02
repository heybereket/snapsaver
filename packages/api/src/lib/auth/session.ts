import axios from "axios";
import { COOKIE_NAME } from "../constants";
import { FastifyReply, FastifyRequest } from "fastify";

export const authenticateUser = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const token = req.cookies[COOKIE_NAME] as string | undefined;

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "No session token found",
      });
    }

    const googleUserInfo = await axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data);

    req.email = googleUserInfo.email;
    req.googleAccessToken = token;

    // if (
    //   BetaAllowedUsers.ENABLED &&
    //   !BetaAllowedUsers.EMAILS.includes(req.email as string)
    // ) {
    //   res.send({
    //     success: false,
    //     message: `You aren't allowed to use Snapsaver...yet`,
    //   });
    // }

    return googleUserInfo;
  } catch (err) {
    req.email = undefined;
    req.googleAccessToken = undefined;

    return res.status(401).send({
      success: false,
      message: "Invalid or expired session token",
    });
  }
};
