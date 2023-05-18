import "@fastify/jwt";

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    user: {
      avatarUrl: string;
      name: string;
      sub: string;
    };
  }
}
