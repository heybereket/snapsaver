import { FastifyPluginCallback } from "fastify";

const googleLogout: FastifyPluginCallback = async (fastify) => {
  fastify.get("/logout", async (req, res) => {
    req.logout();
    res.send({
      success: true,
      message: "Successfully logged out",
    });
  });
};

export default googleLogout;
