import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticateUser } from "../../lib/auth/session";
import { downloadMemoriesJob } from "../../lib/jobs/downloadQueue";

const schema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["ALL", "PHOTO", "VIDEO"]).optional(),
});

export default (fastify: FastifyInstance, opts, done) => {
  fastify.post(
    "/download",
    { preHandler: [authenticateUser] },
    async (req: any, res) => {
      const { startDate, endDate, type } = schema.parse(req.body);
      const { email, googleAccessToken } = req;

      downloadMemoriesJob({
        email,
        startDate: startDate as string,
        endDate: endDate as string,
        type: type as string,
        googleAccessToken,
      });

      res.send({ message: "started" });
    }
  );

  done();
};
