import Fastify from "fastify";
import cors from "fastify-cors";
import autoLoad from "fastify-autoload";
import fastifyPassport from "fastify-passport";
import fm from 'fastify-multipart'
import fastifySecureSession from "fastify-secure-session";
import "dotenv/config";
import path from "path";
import fs from "fs";

import { join } from "path";
import { PORT } from "./lib/constants";
import * as log from "./lib/log";
import { googleStrategy } from "./lib/auth/google";

const fastify = Fastify();

fastify.addContentTypeParser("*", function (req, done) {
  done(null, req);
});

fastify.register(fm);

void fastify.register(autoLoad, {
  dir: join(__dirname, "./routes"),
  options: { prefix: "/v1" },
});

void fastify.register(cors, {
  credentials: true,
  origin: [
    "https://snapsaver.me",
    "https://snapsaver.vercel.app",
    "https://www.snapsaver.me",
    "http://localhost:3000",
  ],
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
});

fastify.register(fastifySecureSession, {
  cookieName: "snapsaver-session",
  key: fs.readFileSync(path.join(__dirname, "../secret-key")),
  cookie: {
    path: "/",
  },
});

fastify.register(fastifyPassport.initialize());
fastify.register(fastifyPassport.secureSession());

fastifyPassport.registerUserDeserializer(async (user, req) => {
  return user;
});

fastifyPassport.registerUserSerializer(async (user, req) => {
  return user;
});

fastifyPassport.use("google", googleStrategy());

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
  log.ready(`API > Running on ${address}`);
});
