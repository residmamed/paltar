import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ListingState } from "@/generated/prisma/enums";
import { ListingStateBadge } from "@/components/listings/listing-state-badge";
import { ReviewActions } from "@/components/admin/review-actions";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Elan yoxlaması" };

export default async function AdminListingReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [listing, td, tcat, tcond] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        owner: {
          select: { displayName: true, email: true, phone: true },
        },
      },
    }),
    getTranslations("department"),
    getTranslations("category"),
    getTranslations("condition"),
  ]);

  if (!listing) notFound();

  const fields: { label: string; value: string }[] = [
    { label: "Bölmə", value: td(listing.department) },
    { label: "Kateqoriya", value: tcat(listing.category) },
    { label: "Vəziyyət", value: tcond(listing.condition) },
    { label: "Marka", value: listing.brand || "—" },
    { label: "Ölçü", value: listing.size },
    {
      label: "Qiymət",
      value: `${formatPrice(listing.priceMinor)}${listing.negotiable ? " · razılaşma yolu ilə" : ""}`,
    },
    { label: "Şəhər", value: listing.city },
    { label: "Əlaqə telefonu", value: listing.contactPhone },
    { label: "Göndərilmə", value: formatDateTime(listing.createdAt) },
  ];

  const owner =
    listing.owner.displayName ||
    listing.owner.email ||
    listing.owner.phone ||
    "—";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="size-4" />
        Növbəyə qayıt
      </Link>

      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl font-bold">{listing.title}</h2>
        <ListingStateBadge state={listing.state} />
      </div>

      {listing.state === ListingState.REJECTED && listing.rejectionReason && (
        <Alert>Rədd səbəbi: {listing.rejectionReason}</Alert>
      )}

      {listing.images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {listing.images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100"
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="mb-3 text-sm text-zinc-500">
          Satıcı: <span className="font-medium text-zinc-800">{owner}</span>
        </p>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex justify-between gap-3 border-b border-zinc-100 pb-2"
            >
              <dt className="text-sm text-zinc-500">{f.label}</dt>
              <dd className="text-right text-sm font-medium text-zinc-900">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4">
          <p className="mb-1 text-sm text-zinc-500">Təsvir</p>
          <p className="whitespace-pre-wrap text-sm text-zinc-800">
            {listing.description}
          </p>
        </div>
      </div>

      {(listing.state === ListingState.PENDING ||
        listing.state === ListingState.ACTIVE) && (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <p className="mb-3 text-sm font-medium text-zinc-700">
            {listing.state === ListingState.PENDING
              ? "Bu elanı dərc etmək üçün təsdiqləyin və ya səbəblə rədd edin."
              : "Bu elan artıq dərc olunub. Lazım gələrsə səbəblə silə bilərsiniz."}
          </p>
          <ReviewActions
            listingId={listing.id}
            allowApprove={listing.state === ListingState.PENDING}
          />
        </div>
      )}
    </div>
  );
}
