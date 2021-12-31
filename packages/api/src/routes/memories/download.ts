import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticateUser } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";
import util from "../../lib/util";

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
      const email = util.getUserEmail(req);
      const { startDate, endDate } = schema.parse(req.body);
      SnapSaver.downloadMemories(email, startDate as string, endDate as string);

      await res.send({
        message: "started",
      });
    }
  );

  done();
};
