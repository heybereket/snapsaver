import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import { MEGABYTE } from "../../lib/constants";
import util from "../../lib/util";
import ss from "../../lib/snapsaver";
import { uploadMemoriesJob } from "../../lib/jobs/uploadQueue";

const Snapsaver = new ss();

export default (fastify: FastifyInstance, opts, done) => {
  fastify.post(
    "/upload",
    { preHandler: [authenticateUser] },
    async (req, res) => {
      const { email } = req;
      const options = { limits: { fileSize: 8 * MEGABYTE } };
      const data = await req.file(options);
      const buffer = await data.toBuffer();
      const memoriesJson: JSON = util.bufferToJson(buffer);
      const isValid = Snapsaver.validateMemoriesJson(memoriesJson);

      if (!isValid) {
        return res.send({ message: "invalid" });
      }

      uploadMemoriesJob({
        memoriesJson,
        email,
      });

      res.send({ message: "started" });
    }
  );

  done();
};
