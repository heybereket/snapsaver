import axios from "axios";
import { CLIENT_URL, COOKIE_NAME, IS_PRODUCTION } from "../constants";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../connections/prisma";

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

    const user = await prisma.user.findUnique({
      where: {
        email: req.email,
      },
    });

    if (!user?.betaUser) {
      res.send({
        success: false,
        message: `You aren't a beta user...yet.`,
        user
      });
      
      res.redirect(CLIENT_URL);
    }

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
