import axios from "axios";
import { COOKIE_NAME } from "../constants";
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

    const user = await prisma.user.findUnique({
      where: {
        email: googleUserInfo.email,
      },
    });

    req.email = googleUserInfo.email;
    req.googleAccessToken = token;
    req.isBeta = (user && user?.betaUser) as boolean;

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
