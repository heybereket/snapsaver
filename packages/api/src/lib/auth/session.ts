import { FastifyReply, FastifyRequest } from "fastify";

export async function getSession(req: FastifyRequest, res: FastifyReply) {
	const token = req.cookies["snapsaver-session"] as string | undefined;

	if (!token) {
		res.status(401).send({
            success: false,
            message: "No session token found",
        });
	}

    return req.user;
}