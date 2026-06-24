import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

/** Build a unique storefront slug from a store name. */
export async function ensureUniqueStoreSlug(name: string): Promise<string> {
  const base = slugify(name) || "magaza";
  let candidate = base;
  let suffix = 0;

  while (await prisma.storeProfile.findUnique({ where: { slug: candidate } })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}
