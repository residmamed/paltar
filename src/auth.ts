import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { verifyOtp } from "@/lib/otp";
import { normalizePhone } from "@/lib/phone";
import { emailLoginSchema, phoneVerifySchema, storeNameSchema } from "@/lib/validations/auth";
import { ensureUniqueStoreSlug } from "@/lib/store-slug";
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
      credentials: {
        phone: {},
        code: {},
        authMode: {},
        accountType: {},
        storeName: {},
      },
      async authorize(raw) {
        const parsed = phoneVerifySchema.safeParse(raw);
        if (!parsed.success) return null;
        const phone = normalizePhone(parsed.data.phone);
        if (!phone) return null;

        const result = await verifyOtp(phone, parsed.data.code);
        if (!result.ok) return null;

        const authMode = raw?.authMode === "register" ? "register" : "login";
        const accountType = raw?.accountType === "business" ? "business" : "individual";

        if (authMode === "login") {
          const user = await prisma.user.findUnique({ where: { phone } });
          if (!user || user.bannedAt) return null;
          return {
            id: user.id,
            name: user.displayName,
            role: user.role,
          };
        }

        if (accountType === "business") {
          const storeParsed = storeNameSchema.safeParse(raw?.storeName);
          if (!storeParsed.success) return null;

          const existing = await prisma.user.findUnique({ where: { phone } });
          if (existing) return null;

          const slug = await ensureUniqueStoreSlug(storeParsed.data);
          const user = await prisma.user.create({
            data: {
              phone,
              phoneVerified: true,
              displayName: storeParsed.data,
              role: Role.STORE,
              storeProfile: {
                create: { name: storeParsed.data, slug },
              },
            },
          });
          return {
            id: user.id,
            name: user.displayName,
            role: user.role,
          };
        }

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
