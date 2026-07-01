import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { Gem, MapPin, Search, Shirt, Sparkles, Store, Tag } from "lucide-react";
import { prisma } from "@/lib/db";
import { CATEGORIES, DEPARTMENTS, TOP_STORES_PANEL_SIZE } from "@/lib/constants";
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

type SponsoredShop = {
  name: string;
  slug: string;
  logoUrl?: string | null;
  accent: string;
  thumbnails: { title: string; url?: string | null; swatch: string }[];
};

const sampleSponsoredShops: SponsoredShop[] = [
  {
    name: "Nizami Vintage",
    slug: "nizami-vintage",
    accent: "#D89B3C",
    thumbnails: [
      { title: "Trenç", swatch: "bg-[#A86E3E]" },
      { title: "Cins", swatch: "bg-[#38537A]" },
      { title: "Çanta", swatch: "bg-[#B65A3A]" },
      { title: "Köynək", swatch: "bg-[#E9DFC9]" },
    ],
  },
  {
    name: "Sahil Closet",
    slug: "sahil-closet",
    accent: "#2F3A8F",
    thumbnails: [
      { title: "Pencək", swatch: "bg-[#241F1C]" },
      { title: "Lofer", swatch: "bg-[#7B7064]" },
      { title: "Kəmər", swatch: "bg-[#D89B3C]" },
      { title: "Sviter", swatch: "bg-[#C9C2B4]" },
    ],
  },
  {
    name: "Yasamal Kids",
    slug: "yasamal-kids",
    accent: "#B65A3A",
    thumbnails: [
      { title: "Kurtka", swatch: "bg-[#6E8B7D]" },
      { title: "Bot", swatch: "bg-[#B65A3A]" },
      { title: "Papaq", swatch: "bg-[#D89B3C]" },
      { title: "Don", swatch: "bg-[#F4C7B8]" },
    ],
  },
  {
    name: "İçərişəhər Denim",
    slug: "icherisheher-denim",
    accent: "#2F3A8F",
    thumbnails: [
      { title: "Cins", swatch: "bg-[#2F3A8F]" },
      { title: "Jaket", swatch: "bg-[#38537A]" },
      { title: "Köynək", swatch: "bg-[#8EA4BF]" },
      { title: "Ətək", swatch: "bg-[#587190]" },
    ],
  },
];

export default async function Home() {
  const [th, td, tcat, tc, diamondListings, recommendedListings, storeAds] =
    await Promise.all([
      getTranslations("home"),
      getTranslations("department"),
      getTranslations("category"),
      getTranslations("common"),
      emptyOnDatabaseUnavailable(() =>
        prisma.listing.findMany({
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
      emptyOnDatabaseUnavailable(() =>
        prisma.listing.findMany({
          where: { state: ListingState.ACTIVE },
          include: { images: { orderBy: { position: "asc" }, take: 1 } },
          orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
          take: 12,
        }),
      ),
      emptyOnDatabaseUnavailable(() =>
        prisma.storeAd.findMany({
          where: {
            startsAt: { lte: new Date() },
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
          take: TOP_STORES_PANEL_SIZE,
          select: {
            storeProfile: {
              select: {
                name: true,
                slug: true,
                logoUrl: true,
                user: {
                  select: {
                    listings: {
                      where: { state: ListingState.ACTIVE },
                      orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
                      take: 4,
                      select: {
                        title: true,
                        images: {
                          orderBy: { position: "asc" },
                          take: 1,
                          select: { url: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      ),
    ]);

  const sponsoredShops = normalizeSponsoredShops(storeAds);
  const railShops =
    sponsoredShops.length >= 3
      ? sponsoredShops
      : [...sponsoredShops, ...sampleSponsoredShops].slice(0, 6);

  return (
    <div className="bg-[#F3EEE4] text-[#241F1C]">
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:pb-10 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <div className="font-tag mb-5 inline-flex items-center gap-2 border border-dashed border-[#C9C2B4] bg-[#FFF9ED] px-3 py-2 text-[11px] font-semibold uppercase text-[#2F3A8F]">
              <MapPin className="size-3.5" aria-hidden="true" />
              Bakı üzrə ikinci əl geyim bazarı
            </div>
            <h1 className="font-display max-w-4xl text-4xl leading-[0.95] tracking-normal text-[#241F1C] sm:text-6xl lg:text-7xl">
              {th("heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#6F665B] sm:text-lg">
              {th("heroSubtitle")}
            </p>

            <form action="/search" className="mt-8 max-w-2xl">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="relative block">
                  <span className="sr-only">{tc("search")}</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#2F3A8F]" />
                  <input
                    type="search"
                    name="q"
                    placeholder={th("searchPlaceholder")}
                    className="font-tag tag-cut-lg w-full border-2 border-dashed border-[#C9C2B4] bg-[#FFF9ED] py-4 pl-12 pr-4 text-sm text-[#241F1C] outline-none placeholder:text-[#7B7064] focus:border-[#2F3A8F] focus:ring-4 focus:ring-[#2F3A8F]/15"
                  />
                </label>
                <button
                  type="submit"
                  className="torn-button inline-flex items-center justify-center gap-2 bg-[#D89B3C] px-6 py-4 font-semibold text-[#241F1C] outline-none transition hover:-translate-y-0.5 hover:bg-[#C9892E] focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4]"
                >
                  <Tag className="size-4" aria-hidden="true" />
                  {tc("search")}
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/listings/new"
                className="tag-cut inline-flex items-center gap-2 bg-[#241F1C] px-4 py-2 text-sm font-semibold text-[#F3EEE4] outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4]"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                {th("sellCta")}
              </Link>
              <Link
                href="/stores"
                className="tag-cut inline-flex items-center gap-2 border border-dashed border-[#C9C2B4] bg-[#FFF9ED] px-4 py-2 text-sm font-semibold text-[#2F3A8F] outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4]"
              >
                <Store className="size-4" aria-hidden="true" />
                {th("becomeStoreCta")}
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rotate-[-1.5deg] border-2 border-dashed border-[#C9C2B4] bg-[#FFF9ED] p-5 shadow-[10px_12px_0_rgba(36,31,28,0.08)]">
              <div className="font-tag text-[11px] font-semibold uppercase text-[#B65A3A]">
                bugün bazarda
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-dashed border-[#C9C2B4] pt-5">
                <HeroMetric value="0%" label="platforma ödənişi yoxdur" />
                <HeroMetric value="1:1" label="satıcı ilə birbaşa əlaqə" />
                <HeroMetric value="4" label="mağaza vitrin şəkli" />
                <HeroMetric value="₼5" label="mağaza açılışı" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <MobileSponsoredStrip shops={railShops} />

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 lg:grid-cols-[200px_minmax(0,1fr)_200px] xl:grid-cols-[220px_minmax(0,1fr)_220px]">
        <SponsoredRail shops={railShops.slice(0, 4)} side="left" />

        <main className="min-w-0">
          <section className="py-6">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl tracking-normal">Rəflər</h2>
                <p className="mt-1 text-sm text-[#6F665B]">
                  Şöbə və kateqoriyaları eyni etiket sistemi ilə gəz.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DEPARTMENTS.map((dep) => (
                <CategoryTag key={dep} href={`/search?department=${dep}`} label={td(dep)} strong />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {CATEGORIES.map((cat) => (
                <CategoryTag key={cat} href={`/search?category=${cat}`} label={tcat(cat)} />
              ))}
            </div>
          </section>

          <DiamondSection title={th("diamondListings")} listings={diamondListings} />
          <ListingSection title={th("recommended")} listings={recommendedListings} />
        </main>

        <SponsoredRail shops={[...railShops].reverse().slice(0, 4)} side="right" />
      </div>
    </div>
  );
}

function normalizeSponsoredShops(
  storeAds: {
    storeProfile: {
      name: string;
      slug: string;
      logoUrl: string | null;
      user: {
        listings: {
          title: string;
          images: { url: string }[];
        }[];
      };
    };
  }[],
): SponsoredShop[] {
  const swatches = ["bg-[#D89B3C]", "bg-[#2F3A8F]", "bg-[#B65A3A]", "bg-[#C9C2B4]"];

  return storeAds.map((ad, shopIndex) => ({
    name: ad.storeProfile.name,
    slug: ad.storeProfile.slug,
    logoUrl: ad.storeProfile.logoUrl,
    accent: shopIndex % 2 === 0 ? "#D89B3C" : "#B65A3A",
    thumbnails: Array.from({ length: 4 }, (_, index) => {
      const listing = ad.storeProfile.user.listings[index];

      return {
        title: listing?.title ?? "Mağaza vitrini",
        url: listing?.images[0]?.url,
        swatch: swatches[index % swatches.length],
      };
    }),
  }));
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-tag tag-cut inline-block bg-[#D89B3C] px-2 py-1 text-sm font-bold">
        {value}
      </div>
      <p className="mt-2 text-xs leading-5 text-[#6F665B]">{label}</p>
    </div>
  );
}

function CategoryTag({
  href,
  label,
  strong = false,
}: {
  href: string;
  label: string;
  strong?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`tag-cut inline-flex min-h-12 items-center justify-center border border-dashed px-4 py-3 text-center text-sm font-semibold outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4] ${
        strong
          ? "border-[#D89B3C] bg-[#D89B3C] text-[#241F1C]"
          : "border-[#C9C2B4] bg-[#FFF9ED] text-[#241F1C] hover:border-[#2F3A8F] hover:text-[#2F3A8F]"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileSponsoredStrip({ shops }: { shops: SponsoredShop[] }) {
  return (
    <section className="border-y border-dashed border-[#C9C2B4] bg-[#E9DFC9] py-5 lg:hidden">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg">Reklam mağazalar</h2>
          <Link
            href="/stores"
            className="text-sm font-semibold text-[#2F3A8F] outline-none focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#E9DFC9]"
          >
            Hamısı
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {shops.map((shop, index) => (
            <div key={`${shop.slug}-${index}`} className="w-56 shrink-0">
              <SponsoredShopCard shop={shop} rotate={index % 2 === 0 ? "-1.2deg" : "1.4deg"} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsoredRail({ shops, side }: { shops: SponsoredShop[]; side: "left" | "right" }) {
  const repeated = [...shops, ...shops];

  return (
    <aside className="hidden lg:block" aria-label="Reklam mağazalar">
      <div className="ad-rail sticky top-24 h-[calc(100vh-7rem)] overflow-hidden">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-tag text-[10px] font-semibold uppercase text-[#B65A3A]">
            Reklam
          </span>
          <span className="h-px flex-1 border-t border-dashed border-[#C9C2B4]" />
        </div>
        <div className="ad-rail-track flex flex-col gap-5 pb-5">
          {repeated.map((shop, index) => (
            <SponsoredShopCard
              key={`${side}-${shop.slug}-${index}`}
              shop={shop}
              rotate={index % 2 === 0 ? "-1.6deg" : "1.8deg"}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

function SponsoredShopCard({ shop, rotate }: { shop: SponsoredShop; rotate: string }) {
  return (
    <Link
      href={`/stores/${shop.slug}`}
      className="hanging-tag group relative block rotate-[var(--tag-rotate)] border border-dashed border-[#C9C2B4] bg-[#FFF9ED] p-3 shadow-[5px_7px_0_rgba(36,31,28,0.08)] outline-none transition duration-200 hover:-translate-y-1 hover:rotate-0 hover:border-[#D89B3C] focus-visible:rotate-0 focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4]"
      style={{ "--tag-rotate": rotate } as CSSProperties}
    >
      <span className="absolute left-1/2 top-2 size-3 -translate-x-1/2 rounded-full border border-[#C9C2B4] bg-[#F3EEE4]" />
      <div className="mt-5 flex items-center gap-2">
        <div
          className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-dashed border-[#C9C2B4] bg-[#E9DFC9] text-sm font-bold"
          style={{ color: shop.accent }}
        >
          {shop.logoUrl ? (
            <Image
              src={shop.logoUrl}
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-cover"
              sizes="40px"
            />
          ) : (
            shop.name.slice(0, 1)
          )}
        </div>
        <div className="min-w-0">
          <div className="font-tag mb-1 inline-block bg-[#B65A3A] px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
            Reklam
          </div>
          <h3 className="truncate text-sm font-bold text-[#241F1C]">{shop.name}</h3>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {shop.thumbnails.map((thumb, index) => (
          <div key={`${thumb.title}-${index}`} className={`relative aspect-square overflow-hidden ${thumb.swatch}`}>
            {thumb.url ? (
              <Image
                src={thumb.url}
                alt=""
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="96px"
              />
            ) : (
              <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(135deg,rgba(255,255,255,.55)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.55)_50%,rgba(255,255,255,.55)_75%,transparent_75%,transparent)] [background-size:10px_10px]" />
            )}
          </div>
        ))}
      </div>
    </Link>
  );
}

function DiamondSection({ title, listings }: { title: string; listings: PublicListing[] }) {
  return (
    <section className="py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-2xl tracking-normal">
            <Gem className="size-5 text-[#2F3A8F]" aria-hidden="true" />
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#6F665B]">
            Ödənişli önə çıxarma üçün ayrılmış vitrin.
          </p>
        </div>
        <Link
          href="/stores"
          className="hidden text-sm font-semibold text-[#2F3A8F] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4] sm:inline"
        >
          Necə işləyir?
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="grid gap-6 border-2 border-dashed border-[#C9C2B4] bg-[#FFF9ED] p-6 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
          <div className="relative mx-auto grid aspect-square w-40 place-items-center border border-dashed border-[#C9C2B4] bg-[#F3EEE4]">
            <Shirt className="size-20 stroke-[1.2] text-[#2F3A8F]" aria-hidden="true" />
            <span className="font-tag tag-cut absolute -bottom-3 bg-[#D89B3C] px-3 py-1 text-xs font-bold">
              DIAMOND
            </span>
          </div>
          <div>
            <p className="font-display text-2xl leading-tight tracking-normal">
              İlk Diamond elan üçün yer hazırdır.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#6F665B]">
              Mağaza sahibləri ən yaxşı geyimi bu vitrində önə çıxara bilər. Elan təsdiqləndikdən
              sonra Diamond yerləşdirmə al və alıcıların ilk baxdığı sırada görün.
            </p>
            <Link
              href="/listings/new"
              className="torn-button mt-5 inline-flex items-center gap-2 bg-[#D89B3C] px-5 py-3 text-sm font-semibold text-[#241F1C] outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFF9ED]"
            >
              <Gem className="size-4" aria-hidden="true" />
              İlk elanı önə çıxar
            </Link>
          </div>
        </div>
      ) : (
        <ListingGrid listings={listings} />
      )}
    </section>
  );
}

function ListingSection({ title, listings }: { title: string; listings: PublicListing[] }) {
  return (
    <section className="py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl tracking-normal">{title}</h2>
        <Link
          href="/search"
          className="text-sm font-semibold text-[#2F3A8F] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4]"
        >
          Hamısına bax
        </Link>
      </div>
      {listings.length === 0 ? (
        <div className="flex min-h-36 items-center justify-center border border-dashed border-[#C9C2B4] bg-[#FFF9ED] p-6 text-center text-sm text-[#6F665B]">
          Hələ elan yoxdur. İlk geyimi sən yerləşdir.
        </div>
      ) : (
        <ListingGrid listings={listings} />
      )}
    </section>
  );
}

function ListingGrid({ listings }: { listings: PublicListing[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
