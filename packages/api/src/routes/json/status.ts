import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";
const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/status",
    { preHandler: [authenticateUser] },
    async (req, res) => {
      const { success, pending, failed, expectedTotal } = await SnapSaver.isMemoriesJsonAvailable(req.email as string);

      await res.send({
        success,
        pending,
        failed,
        expectedTotal
      });
    }
  );

  done();
};
