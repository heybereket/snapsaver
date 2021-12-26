import { FastifyPluginCallback } from "fastify";

const googleMe: FastifyPluginCallback = async (fastify) => {
  fastify.get("/@me", async (req, res) => {
    res.send({
      success: true,
      data: req.user,
    });
  });
};

export default googleMe;
