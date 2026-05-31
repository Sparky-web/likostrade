import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import type { User } from "generated/prisma";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: Pick<User, "email" | "name" | "id">;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  // Self-hosted за reverse proxy: без trustHost в production падает UntrustedHost.
  trustHost: true,
  providers: [
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }
        const { email, password } = credentials;

        // Найдите пользователя в базе данных
        const user = await db.user.findUnique({
          where: { email },
        });

        // Если пользователь найден и пароли совпадают
        if (user && (await compare(password, user.password))) {
          return {
            name: user.name,
            email: user.email,
            id: user.id,
          }; // Вернуть данные пользователя, если авторизация успешна
        }

        // Если авторизация не удалась, вернуть null
        return null;
      },
    }),
  ],
  jwt: {
    maxAge: 60 * 60 * 24 * 512,
  },
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(db),
  callbacks: {
    async jwt({ token }) {
      if (token.sub) {
        const data = await db.user.findFirst({
          where: {
            id: token.sub,
          },
        });

        if (data) {
          const { password: _password, ...userWithoutPassword } = data;
          token = { ...token, user: userWithoutPassword };
        }
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
