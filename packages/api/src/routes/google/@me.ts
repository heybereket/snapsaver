import { FastifyPluginCallback } from "fastify";

const googleMe: FastifyPluginCallback = async (fastify) => {
  fastify.get("/@me", async (req, res) => {
    req.logout();
    res.send({
      success: true,
      data: req.user,
    });
  });
};

export default googleMe;
