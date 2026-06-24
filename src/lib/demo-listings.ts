import {
  Category,
  Condition,
  Department,
  ListingState,
  PromotionTier,
} from "@/generated/prisma/enums";

export type PublicListing = {
  id: string;
  title: string;
  description: string;
  department: Department;
  category: Category;
  condition: Condition;
  brand: string | null;
  size: string;
  priceMinor: number;
  negotiable: boolean;
  city: string;
  contactPhone: string;
  state: ListingState;
  approvedAt: Date | null;
  createdAt: Date;
  images: { id?: string; url: string; position?: number }[];
  owner?: { displayName: string | null; email: string | null; phone: string | null };
  promotions?: { tier: PromotionTier; expiresAt: Date }[];
};

const departments = [
  { value: Department.MEN, label: "Kişi", sizes: ["S", "M", "L", "XL", "32", "42"] },
  { value: Department.WOMEN, label: "Qadın", sizes: ["XS", "S", "M", "L", "38", "One size"] },
  { value: Department.KIDS, label: "Uşaq", sizes: ["4-5 yaş", "6 yaş", "8 yaş", "10 yaş", "31", "One size"] },
  { value: Department.UNISEX, label: "Uniseks", sizes: ["S", "M", "L", "XL", "40", "One size"] },
] as const;

const products = [
  { category: Category.OUTERWEAR, name: "yun palto", brands: ["Zara", "Mango", "COS"] },
  { category: Category.OUTERWEAR, name: "puffer gödəkçə", brands: ["H&M", "Columbia", "The North Face"] },
  { category: Category.TOPS, name: "pambıq köynək", brands: ["Massimo Dutti", "Uniqlo", "Reserved"] },
  { category: Category.TOPS, name: "oversize hoodie", brands: ["Nike", "Adidas", "Champion"] },
  { category: Category.BOTTOMS, name: "cins şalvar", brands: ["Levi's", "Wrangler", "Weekday"] },
  { category: Category.BOTTOMS, name: "kargo şalvar", brands: ["Bershka", "Pull&Bear", "Carhartt"] },
  { category: Category.DRESSES, name: "midi don", brands: ["Zara", "Mango", "Koton"] },
  { category: Category.FOOTWEAR, name: "sneaker", brands: ["Nike", "Adidas", "New Balance"] },
  { category: Category.ACCESSORIES, name: "dəri çanta", brands: ["Aldo", "Furla", "Accessorize"] },
  { category: Category.ACTIVEWEAR, name: "idman dəsti", brands: ["Nike", "Adidas", "Puma"] },
  { category: Category.OTHER, name: "ev geyimi dəsti", brands: ["Penti", "Oysho", "LC Waikiki"] },
] as const;

const cities = ["Bakı", "Gəncə", "Sumqayıt", "Şəki", "Lənkəran", "Mingəçevir"];

export const demoListings: PublicListing[] = Array.from({ length: 100 }, (_, index) => {
  const department = departments[index % departments.length];
  const product = products[index % products.length];
  const brand = product.brands[index % product.brands.length];
  const title = `${department.label} ${product.name}`;
  const createdAt = new Date(Date.UTC(2026, 5, 1 + (index % 16), 10, index % 60));

  return {
    id: `demo-${index + 1}`,
    title,
    description: `${brand} ${title.toLowerCase()}. Təmiz saxlanılıb, gündəlik istifadə və mağaza vitrini üçün uyğundur.`,
    department: department.value,
    category: product.category,
    condition: index % 3 === 0 ? Condition.NEW : Condition.USED,
    brand,
    size: department.sizes[index % department.sizes.length],
    priceMinor: 1200 + ((index * 430) % 14500),
    negotiable: index % 4 === 0,
    city: cities[index % cities.length],
    contactPhone: "+994501112233",
    state: ListingState.ACTIVE,
    approvedAt: createdAt,
    createdAt,
    images: [
      {
        id: `demo-${index + 1}-image`,
        url: `https://placehold.co/600x800/png?text=${encodeURIComponent(title)}`,
        position: 0,
      },
    ],
    owner: {
      displayName: index % 5 === 0 ? "Aysel" : "Vintage Baku",
      email: null,
      phone: "+994501112233",
    },
    promotions:
      index % 10 === 0
        ? [{ tier: PromotionTier.DIAMOND, expiresAt: new Date(Date.UTC(2026, 6, 1)) }]
        : index % 7 === 0
          ? [{ tier: PromotionTier.VIP, expiresAt: new Date(Date.UTC(2026, 6, 1)) }]
          : [],
  };
});

export function searchDemoListings({
  q,
  department,
  category,
}: {
  q?: string;
  department?: Department;
  category?: Category;
}) {
  const needle = q?.trim().toLowerCase();

  return demoListings.filter((listing) => {
    if (department && listing.department !== department) return false;
    if (category && listing.category !== category) return false;
    if (!needle) return true;
    return [
      listing.title,
      listing.description,
      listing.brand ?? "",
      listing.size,
      listing.city,
    ].some((value) => value.toLowerCase().includes(needle));
  });
}

export function findDemoListing(id: string) {
  return demoListings.find((listing) => listing.id === id) ?? null;
}
