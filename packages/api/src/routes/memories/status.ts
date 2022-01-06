import { FastifyInstance } from "fastify";
import { authenticateUser } from "../../lib/auth/session";
import { prisma } from "../../lib/connections/prisma";

export default (fastify: FastifyInstance, opts, done) => {
  fastify.get(
    "/status",
    { preHandler: [authenticateUser] },
    async (req, res) => {
      const user = await prisma.user.findUnique({ where: { email: req.email } });

      await res.send({
        success: user?.memoriesSuccess,
        failed: user?.memoriesFailed,
        total: user?.memoriesTotal,
        activeDownload: user?.activeDownload,
        googleDriveFolderLink: user?.memoriesFolderId ? `https://drive.google.com/drive/folders/${user?.memoriesFolderId}` : null
      });
    }
  );

  done();
};
