import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { CATEGORIES, DEPARTMENTS } from "@/lib/constants";
import { ListingCard } from "@/components/listings/listing-card";
import { Category, Department, ListingState } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { emptyOnDatabaseUnavailable } from "@/lib/prisma-errors";

export const metadata: Metadata = { title: "Elanlar" };

type SearchParams = {
  q?: string;
  department?: string;
  category?: string;
};

function enumValue<T extends string>(values: readonly T[], value?: string): T | undefined {
  return values.find((v) => v === value);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [td, tcat] = await Promise.all([
    getTranslations("department"),
    getTranslations("category"),
  ]);
  const department = enumValue(DEPARTMENTS, sp.department) as Department | undefined;
  const category = enumValue(CATEGORIES, sp.category) as Category | undefined;
  const q = sp.q?.trim();

  const listings = await emptyOnDatabaseUnavailable(
    () => prisma.listing.findMany({
      where: {
        state: ListingState.ACTIVE,
        ...(department ? { department } : {}),
        ...(category ? { category } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
                { size: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
      take: 120,
    }),
  );
  const hrefFor = (next: Partial<SearchParams>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (department) params.set("department", department);
    if (category) params.set("category", category);
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    return query ? `/search?${query}` : "/search";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Elanlar</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {listings.length} aktiv geyim elanı
          </p>
        </div>
        <form action="/search" className="flex max-w-xl gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Geyim, marka və ya ölçü axtar..."
            className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-brand-500"
          />
          {department && <input type="hidden" name="department" value={department} />}
          {category && <input type="hidden" name="category" value={category} />}
          <button className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Axtar
          </button>
        </form>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor({ department: undefined })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              !department ? "border-brand-600 bg-brand-50 text-brand-700" : "border-zinc-200 text-zinc-700",
            )}
          >
            Bütün bölmələr
          </Link>
          {DEPARTMENTS.map((dep) => (
            <Link
              key={dep}
              href={hrefFor({ department: dep })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                department === dep ? "border-brand-600 bg-brand-50 text-brand-700" : "border-zinc-200 text-zinc-700",
              )}
            >
              {td(dep)}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor({ category: undefined })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              !category ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-700",
            )}
          >
            Bütün kateqoriyalar
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={hrefFor({ category: cat })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                category === cat ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-700",
              )}
            >
              {tcat(cat)}
            </Link>
          ))}
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
          Uyğun elan tapılmadı.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
