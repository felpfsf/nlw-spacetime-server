import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";
import { authRoutes } from "./routes/auth";
import { memoriesRoutes } from "./routes/memories";

const port = (process.env.PORT as unknown as number) || 3333;

async function bootstrap() {
  const server = Fastify({
    logger: true,
  });

  await server.register(cors, {
    origin: true,
  });

  await server.register(jwt, {
    secret: process.env.SECRET_JWT!,
  });

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
