import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import ss from "../../lib/snapsaver";
import util from "../../lib/util";

const SnapSaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/status",
    { preHandler: [authenticateUser] },
    async (req: any, res) => {
      const email = util.getUserEmail(req);
      const { ready, json } = await SnapSaver.isMemoriesJsonAvailable(email);

      await res.send({
        ready,
        count: json["Saved Media"]?.length,
      });
    }
  );

  done();
};
