import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function memoriesRoutes(server: FastifyInstance) {
  server.addHook("preHandler", async (request) => {
    // Aqui o jwtVerify vai validar se o usuário está autenticado para acessar a rota
    await request.jwtVerify();
  });

  server.get("/", async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        // Lista apenas as memórias do usuário logado
        id: request.user.sub,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat("..."),
      };
    });
  });

  server.get("/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().cuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const memory = await prisma.memory.findUnique({
      where: {
        id,
      },
    });

    if (!memory?.isPublic && memory?.userId !== request.user.sub) {
      return reply.status(401).send({
        message: "Memória não está publica",
      });
    }

    return memory;
  });

  server.post("/compose", async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.boolean().default(false),
    });

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body);

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    });

    return memory;
  });

  server.put("/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().cuid(),
    });
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.boolean().default(false),
    });
    const { id } = paramsSchema.parse(request.params);
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body);

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send({
        message: "Memoria não pertence ao usuário logado",
      });
    }

    const updatedMemory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    });

    return updatedMemory;
  });

  server.delete("/memories/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().cuid(),
    });
    const { id } = paramsSchema.parse(request.params);

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send({
        message: "Memoria não pertence ao usuário logado",
      });
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    });
  });
}
