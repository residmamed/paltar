import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/generated/prisma/enums";

/** The session user (id + role) without a DB round-trip, or null. */
export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** The full, current DB user. Returns null if signed out or banned. */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.bannedAt) return null;
  return user;
}

/** Require a signed-in, non-banned user or redirect to login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require an admin or redirect. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) redirect("/");
  return user;
}
