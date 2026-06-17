import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { verifyOtp } from "@/lib/otp";
import { normalizePhone } from "@/lib/phone";
import { emailLoginSchema, phoneVerifySchema } from "@/lib/validations/auth";
import { Role } from "@/generated/prisma/enums";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      id: "password",
      name: "Email",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = emailLoginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user || !user.passwordHash || user.bannedAt) return null;
        const ok = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: user.role,
        };
      },
    }),
    Credentials({
      id: "phone-otp",
      name: "Phone",
      credentials: { phone: {}, code: {} },
      async authorize(raw) {
        const parsed = phoneVerifySchema.safeParse(raw);
        if (!parsed.success) return null;
        const phone = normalizePhone(parsed.data.phone);
        if (!phone) return null;

        const result = await verifyOtp(phone, parsed.data.code);
        if (!result.ok) return null;

        // Verifying the phone IS the account: create it on first sign-in.
        const user = await prisma.user.upsert({
          where: { phone },
          update: { phoneVerified: true },
          create: { phone, phoneVerified: true },
        });
        if (user.bannedAt) return null;
        return {
          id: user.id,
          name: user.displayName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.uid = user.id;
        token.role = (user as { role?: Role }).role;
      }
      // Refresh role/ban status from the DB when explicitly asked (e.g. after a
      // store upgrade calls `update()`).
      if (trigger === "update" && token.uid) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.uid as string },
          select: { role: true, bannedAt: true },
        });
        if (!fresh || fresh.bannedAt) return null;
        token.role = fresh.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
