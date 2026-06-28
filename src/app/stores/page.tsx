import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { emptyOnDatabaseUnavailable } from "@/lib/prisma-errors";
import { ListingState, Role } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Mağazalar" };

export default async function StoresPage() {
  const stores = await emptyOnDatabaseUnavailable(() =>
    prisma.user.findMany({
      where: {
        role: Role.STORE,
        bannedAt: null,
        storeProfile: { isNot: null },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        storeProfile: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        listings: {
          where: { state: ListingState.ACTIVE },
          orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            title: true,
            priceMinor: true,
            images: {
              orderBy: { position: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mağazalar</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {stores.length} mağaza qeydiyyatdan keçib
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {stores.map((store) => {
          if (!store.storeProfile) return null;

          return (
            <section
              key={store.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200"
            >
              <div className="relative aspect-[4/1] min-h-32 overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-fuchsia-600">
                {store.storeProfile.logoUrl && (
                  <Image
                    src={store.storeProfile.logoUrl}
                    alt={store.storeProfile.name}
                    width={1200}
                    height={300}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 1152px) 100vw, 1152px"
                    priority={false}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
                  <h2 className="min-w-0 truncate text-2xl font-bold text-white sm:text-3xl">
                    {store.storeProfile.name}
                  </h2>
                  <Link
                    href={`/stores/${store.storeProfile.slug}`}
                    className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-100"
                  >
                    Mağazaya bax
                  </Link>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6">
                {store.listings.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {store.listings.map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/listings/${listing.id}`}
                        className="group w-40 shrink-0"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
                          {listing.images[0]?.url ? (
                            <Image
                              src={listing.images[0].url}
                              alt={listing.title}
                              width={320}
                              height={320}
                              loading="lazy"
                              className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                              sizes="160px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                              Şəkil yoxdur
                            </div>
                          )}
                        </div>
                        <h3 className="mt-2 truncate text-sm font-medium text-zinc-900">
                          {listing.title}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                          {formatPrice(listing.priceMinor)}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400">
                    Hələ məhsul yoxdur
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
