import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime, cn } from "@/lib/utils";
import { ListingState } from "@/generated/prisma/enums";
import { ListingStateBadge } from "@/components/listings/listing-state-badge";
import { ReviewActions } from "@/components/admin/review-actions";

export const metadata: Metadata = { title: "Elan yoxlaması" };

const TABS: { key: string; label: string; state?: ListingState }[] = [
  { key: "PENDING", label: "Yoxlanılır", state: ListingState.PENDING },
  { key: "ACTIVE", label: "Aktiv", state: ListingState.ACTIVE },
  { key: "REJECTED", label: "Rədd edilmiş", state: ListingState.REJECTED },
  { key: "ALL", label: "Hamısı" },
];

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const sp = await searchParams;
  const active = TABS.find((t) => t.key === sp.state) ?? TABS[0];

  const listings = await prisma.listing.findMany({
    where: active.state ? { state: active.state } : {},
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      owner: { select: { displayName: true, email: true, phone: true } },
    },
    orderBy: {
      createdAt: active.state === ListingState.PENDING ? "asc" : "desc",
    },
    take: 100,
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/listings?state=${t.key}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition",
              t.key === active.key
                ? "bg-brand-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
          {active.state === ListingState.PENDING
            ? "Yoxlama gözləyən elan yoxdur."
            : "Bu bölmədə elan yoxdur."}
        </div>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => {
            const owner = l.owner.displayName || l.owner.email || l.owner.phone || "—";
            return (
              <li
                key={l.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/admin/listings/${l.id}`}
                  className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100"
                >
                  {l.images[0] && (
                    <Image
                      src={l.images[0].url}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/listings/${l.id}`}
                      className="truncate font-medium hover:underline"
                    >
                      {l.title}
                    </Link>
                    <ListingStateBadge state={l.state} />
                  </div>
                  <p className="text-sm text-zinc-600">{formatPrice(l.priceMinor)}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {owner} · {formatDateTime(l.createdAt)}
                  </p>
                  {l.state === ListingState.REJECTED && l.rejectionReason && (
                    <p className="mt-1 text-xs text-red-600">
                      Səbəb: {l.rejectionReason}
                    </p>
                  )}
                </div>

                {l.state === ListingState.PENDING && (
                  <div className="shrink-0 sm:w-64">
                    <ReviewActions listingId={l.id} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
