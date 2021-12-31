import { FastifyReply, FastifyRequest } from "fastify";

export const authenticateUser = async (
  req: FastifyRequest,
  res: FastifyReply,
  next: any
) => {
  const token = req.cookies["snapsaver-session"] as string | undefined;

  if (!token) {
    return res.status(401).send({
      success: false,
      message: "No session token found",
    });
  }

  next();
};
