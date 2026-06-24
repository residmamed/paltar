import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { ListingState } from "@/generated/prisma/enums";
import { nullOnDatabaseUnavailable } from "@/lib/prisma-errors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await nullOnDatabaseUnavailable(
    () => prisma.listing.findUnique({
      where: { id },
      select: { title: true, state: true },
    }),
  );
  if (!listing || listing.state !== ListingState.ACTIVE) return { title: "Elan" };
  return { title: listing.title };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, td, tcat, tcond] = await Promise.all([
    nullOnDatabaseUnavailable(
      () => prisma.listing.findUnique({
        where: { id },
        include: {
          images: { orderBy: { position: "asc" } },
          owner: { select: { displayName: true, email: true, phone: true } },
        },
      }),
    ),
    getTranslations("department"),
    getTranslations("category"),
    getTranslations("condition"),
  ]);

  if (!listing || listing.state !== ListingState.ACTIVE) notFound();

  const owner =
    listing.owner?.displayName ||
    listing.owner?.email ||
    listing.owner?.phone ||
    "Satıcı";
  const fields = [
    ["Bölmə", td(listing.department)],
    ["Kateqoriya", tcat(listing.category)],
    ["Vəziyyət", tcond(listing.condition)],
    ["Marka", listing.brand || "—"],
    ["Ölçü", listing.size],
    ["Şəhər", listing.city],
    [
      "Dərc edildi",
      listing.approvedAt
        ? formatDateTime(listing.approvedAt)
        : formatDateTime(listing.createdAt),
    ],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/search"
        className="mb-5 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="size-4" />
        Elanlara qayıt
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-3">
          {listing.images[0] && (
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100">
              <Image
                src={listing.images[0].url}
                alt={listing.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            </div>
          )}
          {listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {listing.images.slice(1).map((image) => (
                <div
                  key={image.id ?? image.url}
                  className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100"
                >
                  <Image
                    src={image.url}
                    alt={listing.title}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{listing.title}</h1>
            <p className="mt-2 text-3xl font-bold text-zinc-950">
              {formatPrice(listing.priceMinor)}
            </p>
            {listing.negotiable && (
              <p className="mt-1 text-sm text-zinc-500">Razılaşma yolu ilə</p>
            )}
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-500">Satıcı</p>
            <p className="mt-1 font-medium text-zinc-950">{owner}</p>
            <a
              href={`tel:${listing.contactPhone}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Phone className="size-4" />
              {listing.contactPhone}
            </a>
          </div>

          <dl className="rounded-lg border border-zinc-200 bg-white p-4">
            {fields.map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-zinc-100 py-2 last:border-0"
              >
                <dt className="text-sm text-zinc-500">{label}</dt>
                <dd className="text-right text-sm font-medium text-zinc-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="font-semibold">Təsvir</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
              {listing.description}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
