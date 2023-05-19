import axios from "axios";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const bodySchema = z.object({
  code: z.string(),
});

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  login: z.string(),
  avatar_url: z.string().url(),
});

type userInfoProps = z.infer<typeof userSchema>;

const checkIfUserExists = async (githubId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      githubId,
    },
  });
  return user;
};

const handleCreateUser = async (userInfo: userInfoProps) => {
  return await prisma.user.create({
    data: {
      avatarUrl: userInfo.avatar_url,
      githubId: userInfo.id,
      name: userInfo.name,
      login: userInfo.login,
    },
  });
};

export async function authRoutes(server: FastifyInstance) {
  server.post("/register", async (request) => {
    const { code } = bodySchema.parse(request.body);

    const accessTokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_SECRET,
          code,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token } = accessTokenResponse.data;

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userInfo = userSchema.parse(userResponse.data);

    let user = await checkIfUserExists(userInfo.id);

    if (!user) {
      await handleCreateUser(userInfo);
    }
    const { avatarUrl, name, id } = user || {};
    const spacetimeToken = server.jwt.sign(
      {
        avatarUrl,
        name,
      },
      {
        sub: id,
        expiresIn: "7 days",
      }
    );

    return {
      spacetimeToken,
    };
  });
}
