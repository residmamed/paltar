import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Package, Phone, Store } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { prisma } from "@/lib/db";
import { nullOnDatabaseUnavailable } from "@/lib/prisma-errors";
import { BrandingState, ListingState, Role } from "@/generated/prisma/enums";

type StorePageProps = {
  params: Promise<{ slug: string }>;
};

async function getStore(slug: string) {
  return nullOnDatabaseUnavailable(() =>
    prisma.user.findFirst({
      where: {
        role: Role.STORE,
        bannedAt: null,
        OR: [{ id: slug }, { storeProfile: { slug } }],
        storeProfile: { isNot: null },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        displayName: true,
        createdAt: true,
        storeProfile: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
            bio: true,
            brandingState: true,
          },
        },
        listings: {
          where: { state: ListingState.ACTIVE },
          orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            title: true,
            department: true,
            category: true,
            condition: true,
            brand: true,
            size: true,
            priceMinor: true,
            city: true,
            contactPhone: true,
            images: {
              orderBy: { position: "asc" },
              select: { url: true },
            },
          },
        },
      },
    }),
  );
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug);
  return { title: store?.storeProfile?.name ?? "Mağaza" };
}

export default async function StoreDetailPage({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStore(slug);

  if (!store?.storeProfile) notFound();

  const profile = store.storeProfile;
  const listings = store.listings;
  const bannerImage =
    profile.logoUrl ?? listings.find((listing) => listing.images[0]?.url)?.images[0]?.url;
  const listingPhones = Array.from(
    new Set(listings.map((listing) => listing.contactPhone).filter(Boolean)),
  );
  const contactPhone = store.phone ?? listingPhones[0] ?? null;
  const cities = Array.from(new Set(listings.map((listing) => listing.city))).slice(0, 4);
  const basedLocation = cities.length > 0 ? cities.join(", ") : "Məkan qeyd olunmayıb";
  const isBrandingApproved = profile.brandingState === BrandingState.APPROVED;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/stores"
        className="mb-5 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="size-4" />
        Mağazalara qayıt
      </Link>

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="relative aspect-[4/1] min-h-44 bg-zinc-100">
          {bannerImage ? (
            <Image
              src={bannerImage}
              alt={profile.name}
              fill
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full bg-gradient-to-r from-brand-700 via-zinc-800 to-fuchsia-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="px-4 pb-6 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative flex items-end gap-4">
              <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border-4 border-white bg-zinc-100 shadow-sm sm:size-28">
                {profile.logoUrl ? (
                  <Image
                    src={profile.logoUrl}
                    alt={profile.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <Store className="size-10 text-zinc-400" />
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                  {profile.name}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  {isBrandingApproved ? "Təsdiqlənmiş mağaza" : "Mağaza profili"}
                </p>
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-700">{profile.bio}</p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-950">
                <MapPin className="size-4 text-brand-600" />
                Məkan
              </div>
              <p className="mt-2 text-sm text-zinc-600">{basedLocation}</p>
            </div>

            <div className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-950">
                <Phone className="size-4 text-brand-600" />
                Telefon
              </div>
              {contactPhone ? (
                <a className="mt-2 block text-sm text-zinc-600 hover:text-zinc-950" href={`tel:${contactPhone}`}>
                  {contactPhone}
                </a>
              ) : (
                <p className="mt-2 text-sm text-zinc-600">Telefon qeyd olunmayıb</p>
              )}
            </div>

            <div className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-950">
                <Mail className="size-4 text-brand-600" />
                E-poçt
              </div>
              {store.email ? (
                <a className="mt-2 block truncate text-sm text-zinc-600 hover:text-zinc-950" href={`mailto:${store.email}`}>
                  {store.email}
                </a>
              ) : (
                <p className="mt-2 text-sm text-zinc-600">E-poçt qeyd olunmayıb</p>
              )}
            </div>

            <div className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-950">
                <Package className="size-4 text-brand-600" />
                Məhsullar
              </div>
              <p className="mt-2 text-sm text-zinc-600">{listings.length} aktiv elan</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Mağazanın elanları</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {profile.name} tərəfindən paylaşılan aktiv məhsullar
            </p>
          </div>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white text-sm text-zinc-400">
            Bu mağazada hələ aktiv məhsul yoxdur
          </div>
        )}
      </section>
    </div>
  );
}
