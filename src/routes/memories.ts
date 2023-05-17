import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function memoriesRoutes(server: FastifyInstance) {
  server.get("/", async () => {
    const memories = await prisma.memory.findMany({
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

  server.get("/:id", async (request) => {
    const paramsSchema = z.object({
      id: z.string().cuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const memory = await prisma.memory.findUnique({
      where: {
        id,
      },
    });
    return memory;
  });

  server.post("/memories", async (request) => {
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
        userId: "clhrzs9440000827c3a8n7vdq",
      },
    });

    return memory;
  });

  server.put("/memories/:id", async (request) => {
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

  server.delete("/memories/:id", async (request) => {
    const paramsSchema = z.object({
      id: z.string().cuid(),
    });
    const { id } = paramsSchema.parse(request.params);

    const deletedMemory = await prisma.memory.delete({
      where: {
        id,
      },
    });

    return deletedMemory;
  });
}
