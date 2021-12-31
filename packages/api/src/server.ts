import Fastify from "fastify";
import cors from "fastify-cors";
import autoLoad from "fastify-autoload";
import fastifyOAuth2 from "fastify-oauth2";
import fastifyCookie from "fastify-cookie";
import fm from 'fastify-multipart'
import "dotenv/config";

import { join } from "path";
import { API_URL, CLIENT_URL, IS_PRODUCTION, PORT } from "./lib/constants";
import * as log from "./lib/log";

const fastify = Fastify();

fastify.addContentTypeParser("*", function (req, done) {
  done(null, req);
});

fastify.register(fm);
fastify.register(fastifyCookie);

void fastify.register(autoLoad, {
  dir: join(__dirname, "./routes"),
  options: { prefix: "/v1" },
});

void fastify.register(cors, {
  credentials: true,
  origin: [
    "https://www.snapsaver.me",
    "https://snapsaver.vercel.app",
    CLIENT_URL
  ],
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
});

fastify.register(fastifyOAuth2 as any, {
  name: "googleOAuth2",
  scope: ["email https://www.googleapis.com/auth/drive.file"],
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    auth: fastifyOAuth2.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: `/v1/auth/google`,
  callbackUri: `${API_URL}/auth/google/callback`,
});

// Default Routes
fastify.get("/", async (req, res) => {
  res.send({
    name: "Snapsaver API",
    version: "1.0.0",
  });
});

fastify.get("/ping", async (req, res) => {
  await res.send({ message: "pong" });
});

fastify.addHook("onRequest", (request, reply, done) => {
  const route = request.url;
  const method = request.method;
  const ip = request.ip;

  log.event(`${route} | ${method} | ${ip}`);
  done();
});

fastify.listen(PORT, "0.0.0.0", (err, address) => {
  if (err) throw err;
  log.success(`API > Running on ${address}`);
});
