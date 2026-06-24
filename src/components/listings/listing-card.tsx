import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { formatPrice } from "@/lib/utils";
import type { Category, Condition, Department } from "@/generated/prisma/enums";

type ListingCardProps = {
  listing: {
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
};

export async function ListingCard({ listing }: ListingCardProps) {
  const [td, tcat, tcond] = await Promise.all([
    getTranslations("department"),
    getTranslations("category"),
    getTranslations("condition"),
  ]);
  const image = listing.images[0]?.url;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:border-brand-300 hover:shadow-sm"
    >
      <div className="relative aspect-[3/4] bg-zinc-100">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            Şəkil yoxdur
          </div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-medium text-zinc-900">
            {listing.title}
          </h3>
          <p className="shrink-0 text-sm font-semibold text-zinc-950">
            {formatPrice(listing.priceMinor)}
          </p>
        </div>
        <p className="truncate text-xs text-zinc-500">
          {[listing.brand, tcat(listing.category), listing.size].filter(Boolean).join(" · ")}
        </p>
        <p className="truncate text-xs text-zinc-500">
          {td(listing.department)} · {tcond(listing.condition)} · {listing.city}
        </p>
      </div>
    </Link>
  );
}
