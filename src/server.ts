import cors from '@fastify/cors'
import Fastify from 'fastify'

const port = (process.env.PORT as unknown as number) || 3333

async function bootstrap() {
  const server = Fastify({
    logger: true,
  })

  await server.register(cors, {
    origin: true,
  })

  server.get('/test', () => {
    return 'This is a test'
  })

  await server
    .listen({
      port,
    })
    .then((address) => console.log(`Server listening on ${address}`))
    .catch((error) => {
      console.error(`Error starting server: ${error}`)
      process.exit(1)
    })
}

bootstrap()
