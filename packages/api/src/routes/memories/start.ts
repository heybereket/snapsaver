import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticateUser } from "../../lib/auth/session";
import { MEGABYTE } from "../../lib/constants";
import util from "../../lib/util";
import ss from "../../lib/snapsaver";
import { uploadMemoriesJob } from "../../lib/jobs/uploadQueue";

const Snapsaver = new ss();

const schema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["ALL", "PHOTO", "VIDEO"]).optional(),
});

export default (fastify: FastifyInstance, opts, done) => {
  fastify.post(
    "/start",
    { preHandler: [authenticateUser] },
    async (req, res) => {
      const { email, googleAccessToken } = req;

      const options = { limits: { fileSize: 8 * MEGABYTE } };
      const data = await req.file(options);

      const { startDate, endDate, type } = data.fields;
      const optionalParams = {
        ...(startDate && { startDate: startDate["value"] }),
        ...(endDate && { endDate: endDate["value"] }),
        ...(type && { type: type["value"] }),
      };

      schema.parse(optionalParams);
      console.log(optionalParams)

      const buffer = await data.toBuffer();
      const memoriesJson: JSON = util.bufferToJson(buffer);
      const isValid = Snapsaver.validateMemoriesJson(memoriesJson);

      if (!isValid) {
        return res.send({ message: "invalid" });
      }

      uploadMemoriesJob({
        memoriesJson,
        email,
        startDate: optionalParams.startDate as string,
        endDate: optionalParams.endDate as string,
        type: optionalParams.type as string,
        googleAccessToken,
      });

      res.send({ message: "started" });
    }
  );

  done();
};
