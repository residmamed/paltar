import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Shirt } from "lucide-react";
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
  const isNew = listing.condition === "NEW";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden border border-dashed border-[#C9C2B4] bg-[#FFF9ED] outline-none transition duration-200 hover:-translate-y-1 hover:border-[#D89B3C] hover:shadow-[0_10px_24px_rgba(36,31,28,0.10)] focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4]"
    >
      <div className="relative aspect-[3/4] bg-[#E9DFC9]">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#7B7064]">
            <div className="grid place-items-center gap-2">
              <Shirt className="size-10 stroke-[1.4]" aria-hidden="true" />
              <span className="font-tag text-[10px] uppercase tracking-wide">Şəkil yoxdur</span>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-[#241F1C]">
            {listing.title}
          </h3>
          <p className="font-tag tag-cut shrink-0 bg-[#D89B3C] px-2 py-1 text-xs font-semibold text-[#241F1C]">
            {formatPrice(listing.priceMinor)}
          </p>
        </div>
        <p className="truncate text-xs text-[#6F665B]">
          {[listing.brand, tcat(listing.category), listing.size].filter(Boolean).join(" · ")}
        </p>
        <div className="flex items-center gap-2 text-xs text-[#6F665B]">
          <span
            className={`font-tag tag-cut px-2 py-0.5 text-[10px] font-semibold ${
              isNew ? "bg-[#2F3A8F] text-white" : "bg-[#B65A3A] text-white"
            }`}
          >
            {tcond(listing.condition)}
          </span>
          <span className="truncate">
            {td(listing.department)} · {listing.city}
          </span>
        </div>
      </div>
    </Link>
  );
}
