import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { DEPARTMENTS, CATEGORIES } from "@/lib/constants";
import { ListingCard } from "@/components/listings/listing-card";
import {
  Category,
  Condition,
  Department,
  ListingState,
  PromotionTier,
} from "@/generated/prisma/enums";
import { emptyOnDatabaseUnavailable } from "@/lib/prisma-errors";

type PublicListing = {
  id: string;
  title: string;
  department: Department;
  category: Category;
  condition: Condition;
  brand: string | null;
  size: string;
  priceMinor: number;
  city: string;
  images: { url: string }[];
};

export default async function Home() {
  const [th, td, tcat, tc, diamondListings, recommendedListings] = await Promise.all([
    getTranslations("home"),
    getTranslations("department"),
    getTranslations("category"),
    getTranslations("common"),
    emptyOnDatabaseUnavailable(
      () => prisma.listing.findMany({
        where: {
          state: ListingState.ACTIVE,
          promotions: {
            some: { tier: PromotionTier.DIAMOND, expiresAt: { gt: new Date() } },
          },
        },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
        orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
        take: 8,
      }),
    ),
    emptyOnDatabaseUnavailable(
      () => prisma.listing.findMany({
        where: { state: ListingState.ACTIVE },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
        orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
        take: 12,
      }),
    ),
  ]);
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-12 sm:py-16">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-12 text-white sm:px-12 sm:py-16">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            {th("heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-brand-100">{th("heroSubtitle")}</p>
          <form action="/search" className="mt-8 flex max-w-lg gap-2">
            <input
              type="search"
              name="q"
              placeholder={th("searchPlaceholder")}
              className="flex-1 rounded-full px-5 py-3 text-zinc-900 outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800"
            >
              {tc("search")}
            </button>
          </form>
        </div>
      </section>

      {/* Departments */}
      <section className="py-6">
        <h2 className="mb-4 text-lg font-semibold">{th("browseByDepartment")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DEPARTMENTS.map((dep) => (
            <Link
              key={dep}
              href={`/search?department=${dep}`}
              className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center font-medium text-zinc-800 transition hover:border-brand-500 hover:text-brand-600"
            >
              {td(dep)}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/search?category=${cat}`}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:border-brand-500 hover:text-brand-600"
            >
              {tcat(cat)}
            </Link>
          ))}
        </div>
      </section>

      <ListingSection title={th("diamondListings")} listings={diamondListings} />
      <ListingSection title={th("recommended")} listings={recommendedListings} />
    </div>
  );
}

function ListingSection({
  title,
  listings,
}: {
  title: string;
  listings: PublicListing[];
}) {
  return (
    <section className="py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link href="/search" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Hamısına bax
        </Link>
      </div>
      {listings.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400">
          —
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}
