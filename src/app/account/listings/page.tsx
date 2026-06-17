import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { isUnlimited, countCommittedListings } from "@/lib/listings";
import { REGULAR_LISTING_LIMIT } from "@/lib/constants";
import { ListingState } from "@/generated/prisma/enums";
import { ListingStateBadge } from "@/components/listings/listing-state-badge";
import { ConfirmSubmitButton } from "@/components/listings/confirm-submit-button";
import { LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  activateListing,
  deactivateListing,
  deleteListing,
  markListingSold,
} from "@/app/listings/actions";

export const metadata: Metadata = { title: "Mənim elanlarım" };

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string; limit?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const listings = await prisma.listing.findMany({
    where: { ownerId: user.id },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  const committed = await countCommittedListings(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mənim elanlarım</h1>
        <LinkButton href="/listings/new">Yeni elan</LinkButton>
      </div>

      {sp.created && <Alert variant="success" className="mb-4">Elan göndərildi və yoxlamadadır.</Alert>}
      {sp.updated && <Alert variant="success" className="mb-4">Dəyişikliklər yadda saxlanıldı.</Alert>}
      {sp.limit && <Alert className="mb-4">Aktiv elan limitinə çatmısınız.</Alert>}

      {!isUnlimited(user.role) && (
        <p className="mb-4 text-sm text-zinc-500">
          Aktiv/yoxlanılan elanlar: {committed} / {REGULAR_LISTING_LIMIT}
        </p>
      )}

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
          Hələ elanınız yoxdur.
        </div>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-3"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                {l.images[0] && (
                  <Image src={l.images[0].url} alt="" fill sizes="80px" className="object-cover" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/listings/${l.id}`} className="truncate font-medium hover:underline">
                    {l.title}
                  </Link>
                  <ListingStateBadge state={l.state} />
                </div>
                <span className="text-sm text-zinc-600">{formatPrice(l.priceMinor)}</span>
                {l.state === ListingState.REJECTED && l.rejectionReason && (
                  <span className="mt-1 text-xs text-red-600">Səbəb: {l.rejectionReason}</span>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/listings/${l.id}/edit`}
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
                  >
                    Redaktə
                  </Link>

                  {l.state === ListingState.ACTIVE && (
                    <TransitionButton action={deactivateListing.bind(null, l.id)} className="text-zinc-700 hover:bg-zinc-100">
                      Deaktiv et
                    </TransitionButton>
                  )}
                  {(l.state === ListingState.INACTIVE || l.state === ListingState.SOLD) &&
                    l.approvedAt && (
                      <TransitionButton action={activateListing.bind(null, l.id)} className="text-green-700 hover:bg-green-50">
                        Aktiv et
                      </TransitionButton>
                    )}
                  {(l.state === ListingState.ACTIVE || l.state === ListingState.INACTIVE) && (
                    <TransitionButton action={markListingSold.bind(null, l.id)} className="text-blue-700 hover:bg-blue-50">
                      Satıldı
                    </TransitionButton>
                  )}

                  <ConfirmSubmitButton
                    action={deleteListing.bind(null, l.id)}
                    confirmText="Elanı silmək istədiyinizə əminsiniz?"
                    className="text-red-600 hover:bg-red-50"
                  >
                    Sil
                  </ConfirmSubmitButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TransitionButton({
  action,
  className,
  children,
}: {
  action: () => Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${className ?? ""}`}
      >
        {children}
      </button>
    </form>
  );
}
