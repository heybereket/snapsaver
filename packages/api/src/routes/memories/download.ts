import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getSession } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";
import util from "../../lib/util";

const SnapSaver = new ss();

const schema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export default (fastify: FastifyInstance, opts, done) => {
  fastify.post("/download", async (req: any, res) => {
    const session = await getSession(req, res);
    if (!session) return;

    const email = util.getUserEmail(req);
    const { startDate, endDate } = schema.parse(req.body);
    SnapSaver.downloadMemories(email, startDate as string, endDate as string);

    await res.send({
      message: "started",
    });
  });

  done();
};
