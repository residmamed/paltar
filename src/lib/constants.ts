import {
  Category,
  Condition,
  Department,
  PromotionTier,
} from "@/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Taxonomy (see CONTEXT.md). Labels live in messages/az.json keyed by enum value.
// ---------------------------------------------------------------------------

export const DEPARTMENTS: Department[] = [
  Department.WOMEN,
  Department.MEN,
  Department.KIDS,
  Department.UNISEX,
];

export const CATEGORIES: Category[] = [
  Category.OUTERWEAR,
  Category.TOPS,
  Category.BOTTOMS,
  Category.DRESSES,
  Category.FOOTWEAR,
  Category.ACCESSORIES,
  Category.ACTIVEWEAR,
  Category.OTHER,
];

export const CONDITIONS: Condition[] = [Condition.NEW, Condition.USED];

// ---------------------------------------------------------------------------
// Listing rules (see CONTEXT.md "Listing allowance").
// ---------------------------------------------------------------------------

/** Max PENDING + ACTIVE listings for a Regular user. Stores are unlimited. */
export const REGULAR_LISTING_LIMIT = 5;

/** Min and max images per listing. */
export const MIN_LISTING_IMAGES = 1;
export const MAX_LISTING_IMAGES = 8;

// ---------------------------------------------------------------------------
// Pricing, in AZN minor units (qəpik). Final numbers TBD — see PLAN.md open items.
// ---------------------------------------------------------------------------

/** One-time fee to become a Store: ₼5. */
export const STORE_UPGRADE_PRICE_MINOR = 500;

/** Top Stores homepage slot: ₼30 for 15 days. */
export const STORE_AD_PRICE_MINOR = 3000;
export const STORE_AD_DURATION_DAYS = 15;

/** Max stores shown in the homepage Top Stores panel. */
export const TOP_STORES_PANEL_SIZE = 10;

/** Promotion offerings: tier + duration -> price (qəpik). Placeholder numbers. */
export interface PromotionOffer {
  tier: PromotionTier;
  days: number;
  priceMinor: number;
}

export const PROMOTION_OFFERS: PromotionOffer[] = [
  { tier: PromotionTier.VIP, days: 1, priceMinor: 100 },
  { tier: PromotionTier.VIP, days: 7, priceMinor: 400 },
  { tier: PromotionTier.VIP, days: 15, priceMinor: 700 },
  { tier: PromotionTier.VIP, days: 30, priceMinor: 1200 },
  { tier: PromotionTier.DIAMOND, days: 1, priceMinor: 200 },
  { tier: PromotionTier.DIAMOND, days: 7, priceMinor: 800 },
  { tier: PromotionTier.DIAMOND, days: 15, priceMinor: 1400 },
  { tier: PromotionTier.DIAMOND, days: 30, priceMinor: 2400 },
];

/** Promotion tier rank used for ordering search/browse results (higher = on top). */
export const TIER_RANK: Record<PromotionTier, number> = {
  [PromotionTier.DIAMOND]: 2,
  [PromotionTier.VIP]: 1,
};
