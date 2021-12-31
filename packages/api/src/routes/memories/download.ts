import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticateUser } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";

const SnapSaver = new ss();

const schema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export default (fastify: FastifyInstance, opts, done) => {
  fastify.post(
    "/download",
    { preHandler: [authenticateUser] },
    async (req: any, res) => {
      const { startDate, endDate } = schema.parse(req.body);
      SnapSaver.downloadMemories(req.email, startDate as string, endDate as string);

      await res.send({
        message: "started",
      });
    }
  );

  done();
};
