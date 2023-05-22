import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifystatic from "@fastify/static";
import Fastify from "fastify";
import { resolve } from "path";
import { authRoutes } from "./routes/auth";
import { memoriesRoutes } from "./routes/memories";
import { uploadRoutes } from "./routes/upload";

const port = (process.env.PORT as unknown as number) || 3333;

async function bootstrap() {
  const server = Fastify({
    logger: true,
  });

  await server.register(cors, {
    origin: true,
  });

  await server.register(multipart);
  await server.register(fastifystatic, {
    root: resolve(__dirname, "../uploads"),
    prefix: "/uploads",
  });

  await server.register(jwt, {
    secret: process.env.SECRET_JWT!,
  });

  await server.register(uploadRoutes, { prefix: "/api/upload" });
  await server.register(authRoutes, { prefix: "/api/auth" });
  await server.register(memoriesRoutes, { prefix: "/api/memories" });

  await server
    .listen({
      port,
    })
    .then((address) => console.log(`Server listening on ${address}`))
    .catch((error) => {
      console.error(`Error starting server: ${error}`);
      process.exit(1);
    });
}

bootstrap();
