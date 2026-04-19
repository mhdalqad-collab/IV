import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { pool } from "./db";

declare module "next-auth" {
  interface Session {
    user: { id: string; email: string };
  }
  interface User {
    id: string;
    email: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const { rows } = await pool.query(
          "SELECT id, email, password FROM users WHERE email = $1",
          [email]
        );
        if (!rows.length) return null;

        const ok = await bcrypt.compare(password, rows[0].password);
        if (!ok) return null;

        return { id: String(rows[0].id), email: rows[0].email };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id as string;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  trustHost: true,
});
