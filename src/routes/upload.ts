import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { extname, resolve } from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";

const pump = promisify(pipeline);

// Isso facilitará a conversão, basta alterar o valor megabytes para o valor desejado
const MEGABYTES = 5;
const LIMIT_SIZE = MEGABYTES * 1024 * 1024;

export async function uploadRoutes(server: FastifyInstance) {
  server.post("/", async (request, reply) => {
    const data = await request.file({
      limits: {
        fileSize: LIMIT_SIZE,
      },
    });

    if (!data) {
      return reply.status(400).send({ message: "Nenhum arquivo" });
    }

    const mimeTypeRegex = /^(image|video)\/[a-zA-z]+/;
    const isValidFileFormat = mimeTypeRegex.test(data.mimetype);

    if (!isValidFileFormat) {
      return reply.status(400).send();
    }

    const fileId = randomUUID();
    const extension = extname(data.filename);

    const fileName = fileId.concat(extension);

    const writeStream = createWriteStream(
      resolve(__dirname, "../../uploads/", fileName)
    );

    await pump(data.file, writeStream);

    const fullPath = request.protocol.concat("://").concat(request.hostname);
    const fileUrl = new URL(`/uploads/${fileName}`, fullPath).toString();

    return reply.status(200).send(fileUrl);
  });
}
