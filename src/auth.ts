import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Keeping JWT sessions because current Prisma schema is custom
  // and does not match the default Auth.js adapter models.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      id: "email-password",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsed.success) throw new Error("Invalid credentials");

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.passwordHash) throw new Error("No account found with this email.");
        if (!user.isActive) throw new Error("Account suspended. Contact support.");

        const passwordMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!passwordMatch) throw new Error("Incorrect password.");

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginCount: { increment: 1 },
            authProvider: "email",
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            phone: z.string().min(10),
            userId: z.string().min(1),
          })
          .safeParse(credentials);

        if (!parsed.success) throw new Error("Invalid credentials");

        const user = await prisma.user.findUnique({
          where: { id: parsed.data.userId },
        });

        if (!user || user.phone !== parsed.data.phone) throw new Error("User not found");
        if (!user.isActive) throw new Error("Account suspended.");

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginCount: { increment: 1 },
            phoneVerified: true,
            authProvider: "phone",
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "PATIENT" | "DOCTOR" | "ADMIN";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
