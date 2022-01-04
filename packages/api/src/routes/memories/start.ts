import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticateUser } from "../../lib/auth/session";
import { MEGABYTE } from "../../lib/constants";
import util from "../../lib/util";
import ss from "../../lib/snapsaver";
import storageGoogleDrive from "../../lib/storage/google-drive";
import { uploadMemoriesJob } from "../../lib/jobs/uploadQueue";
import { Readable } from "stream";
import { prisma } from "../../lib/connections/prisma";

const Snapsaver = new ss();
const StorageGoogleDrive = new storageGoogleDrive();

const memoriesJsonSchema = z.object({
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
      const user = await prisma.user.findUnique({ where: { email }});

      if (user?.activeDownload) {
        return res
          .status(202)
          .send({ message: "Active download in progress" });
      }

      const options = { limits: { fileSize: 8 * MEGABYTE } };
      const data = await req.file(options);

      // Validate request form parameters
      const { startDate, endDate, type } = data.fields;
      const optionalParams = {
        ...(startDate && { startDate: startDate["value"] }),
        ...(endDate && { endDate: endDate["value"] }),
        ...(type && { type: type["value"] }),
      };

      try {
        memoriesJsonSchema.parse(optionalParams);
      } catch (err) {
        return res
          .status(400)
          .send({ message: "Invalid request form data", err });
      }

      // Validate memories_history.json
      const buffer = await data.toBuffer();
      const memoriesJson: JSON = util.bufferToJson(buffer);
      const isValid = Snapsaver.validateMemoriesJson(memoriesJson);
      if (!isValid) {
        return res
          .status(422)
          .send({ message: "Invalid memories_history.json" });
      }

      // Upload memories_history.json to user's Google Drive
      try {
        const steam = Readable.from(buffer.toString());
        const fileId = await StorageGoogleDrive.uploadMemoriesJson(
          String(googleAccessToken),
          steam
        );
        await prisma.user.update({
          where: { email },
          data: { memoriesFileId: fileId as string },
        });
      } catch (err) {
        return res.status(403).send({
          message: "Failed to upload memories_history.json to user's drive",
          err: err.message,
        });
      }

      uploadMemoriesJob({
        email,
        startDate: optionalParams.startDate as string,
        endDate: optionalParams.endDate as string,
        type: optionalParams.type as string,
        googleAccessToken,
      });

      return res.status(200).send({ message: "Started" });
    }
  );

  done();
};
