import "dotenv/config";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  Category,
  Condition,
  Department,
  ListingState,
  PromotionTier,
  Role,
  BrandingState,
} from "@/generated/prisma/enums";
import {
  STORE_AD_DURATION_DAYS,
  STORE_AD_PRICE_MINOR,
} from "@/lib/constants";

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/800`;
const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);

async function main() {
  // Clean previously seeded accounts (cascades to their listings/etc.).
  const seedEmails = [
    "admin@paltar.az",
    "user@paltar.az",
    "store@paltar.az",
  ];
  await prisma.user.deleteMany({ where: { email: { in: seedEmails } } });

  await prisma.user.create({
    data: {
      email: "admin@paltar.az",
      passwordHash: await hashPassword("admin1234"),
      displayName: "Admin",
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  const regular = await prisma.user.create({
    data: {
      email: "user@paltar.az",
      passwordHash: await hashPassword("user1234"),
      displayName: "Aysel",
      role: Role.REGULAR,
    },
  });

  const storeUser = await prisma.user.create({
    data: {
      email: "store@paltar.az",
      passwordHash: await hashPassword("store1234"),
      displayName: "Vintage Baku",
      role: Role.STORE,
      storeProfile: {
        create: {
          name: "Vintage Baku",
          slug: "vintage-baku",
          bio: "Seçilmiş ikinci əl və vintage geyimlər.",
          logoUrl: img("vintage-logo"),
          brandingState: BrandingState.APPROVED,
        },
      },
    },
    include: { storeProfile: true },
  });

  type Seed = {
    owner: string;
    title: string;
    desc: string;
    dep: Department;
    cat: Category;
    cond: Condition;
    price: number;
    city: string;
    brand: string;
    size: string;
    negotiable?: boolean;
    state: ListingState;
    promo?: PromotionTier;
  };

  const includeDemoListings = process.env.SEED_DEMO_LISTINGS === "1";
  const catalog = (includeDemoListings ? [
    { dep: Department.MEN, cat: Category.OUTERWEAR, title: "Kişi bomber gödəkçəsi", brand: "Zara", size: "L", price: 6900 },
    { dep: Department.MEN, cat: Category.OUTERWEAR, title: "Kişi yun palto", brand: "Mango", size: "M", price: 12500 },
    { dep: Department.MEN, cat: Category.OUTERWEAR, title: "Su keçirməz yağmurluq", brand: "H&M", size: "XL", price: 5800 },
    { dep: Department.MEN, cat: Category.OUTERWEAR, title: "Cins gödəkçə", brand: "Levi's", size: "M", price: 7600 },
    { dep: Department.MEN, cat: Category.TOPS, title: "Oxford köynək", brand: "Massimo Dutti", size: "L", price: 3900 },
    { dep: Department.MEN, cat: Category.TOPS, title: "Pambıq polo", brand: "Lacoste", size: "M", price: 4200 },
    { dep: Department.MEN, cat: Category.TOPS, title: "Basic qara tişört", brand: "Uniqlo", size: "S", price: 1400 },
    { dep: Department.MEN, cat: Category.TOPS, title: "Flanel köynək", brand: "Pull&Bear", size: "XL", price: 2600 },
    { dep: Department.MEN, cat: Category.BOTTOMS, title: "Levi's 501 cins şalvar", brand: "Levi's", size: "32", price: 6200 },
    { dep: Department.MEN, cat: Category.BOTTOMS, title: "Klassik chino şalvar", brand: "Dockers", size: "34", price: 4500 },
    { dep: Department.MEN, cat: Category.BOTTOMS, title: "Kargo şalvar", brand: "Bershka", size: "M", price: 3700 },
    { dep: Department.MEN, cat: Category.BOTTOMS, title: "Slim fit kostyum şalvarı", brand: "Zara", size: "48", price: 5200 },
    { dep: Department.MEN, cat: Category.FOOTWEAR, title: "Nike Air Force 1", brand: "Nike", size: "42", price: 11800 },
    { dep: Department.MEN, cat: Category.FOOTWEAR, title: "Dəri loafer", brand: "Aldo", size: "43", price: 8400 },
    { dep: Department.MEN, cat: Category.FOOTWEAR, title: "Adidas qaçış ayaqqabısı", brand: "Adidas", size: "41", price: 9200 },
    { dep: Department.MEN, cat: Category.FOOTWEAR, title: "Chelsea bot", brand: "Clarks", size: "44", price: 13500 },
    { dep: Department.MEN, cat: Category.ACCESSORIES, title: "Dəri kəmər", brand: "Tommy Hilfiger", size: "One size", price: 2400 },
    { dep: Department.MEN, cat: Category.ACCESSORIES, title: "Klassik qalstuk", brand: "Hugo Boss", size: "One size", price: 1800 },
    { dep: Department.MEN, cat: Category.ACTIVEWEAR, title: "Adidas idman dəsti", brand: "Adidas", size: "L", price: 7800 },
    { dep: Department.MEN, cat: Category.ACTIVEWEAR, title: "Nike məşq şortu", brand: "Nike", size: "M", price: 3200 },
    { dep: Department.MEN, cat: Category.ACTIVEWEAR, title: "Under Armour hoodie", brand: "Under Armour", size: "XL", price: 6100 },
    { dep: Department.MEN, cat: Category.OTHER, title: "Ev üçün pambıq xalat", brand: "LC Waikiki", size: "L", price: 2900 },
    { dep: Department.MEN, cat: Category.TOPS, title: "Boz trikotaj sviter", brand: "COS", size: "M", price: 5600 },
    { dep: Department.MEN, cat: Category.BOTTOMS, title: "Tünd göy cins", brand: "Wrangler", size: "33", price: 5400 },
    { dep: Department.MEN, cat: Category.OUTERWEAR, title: "Qışlıq parka", brand: "The North Face", size: "L", price: 16500 },
    { dep: Department.WOMEN, cat: Category.OUTERWEAR, title: "Qadın yun paltosu", brand: "Zara", size: "M", price: 11500 },
    { dep: Department.WOMEN, cat: Category.OUTERWEAR, title: "Bej trençkot", brand: "Mango", size: "S", price: 9800 },
    { dep: Department.WOMEN, cat: Category.OUTERWEAR, title: "Dəri biker gödəkçə", brand: "Stradivarius", size: "M", price: 8900 },
    { dep: Department.WOMEN, cat: Category.OUTERWEAR, title: "Qısa puffer gödəkçə", brand: "Bershka", size: "L", price: 7200 },
    { dep: Department.WOMEN, cat: Category.TOPS, title: "İpək bluza", brand: "Massimo Dutti", size: "S", price: 6400 },
    { dep: Department.WOMEN, cat: Category.TOPS, title: "Ağ oversize köynək", brand: "H&M", size: "M", price: 3100 },
    { dep: Department.WOMEN, cat: Category.TOPS, title: "Krujeva top", brand: "Zara", size: "XS", price: 2800 },
    { dep: Department.WOMEN, cat: Category.TOPS, title: "Trikotaj kardiqan", brand: "Mango", size: "L", price: 5300 },
    { dep: Department.WOMEN, cat: Category.BOTTOMS, title: "Yüksək bel cins", brand: "Levi's", size: "28", price: 6800 },
    { dep: Department.WOMEN, cat: Category.BOTTOMS, title: "Midi ətək", brand: "Reserved", size: "M", price: 3600 },
    { dep: Department.WOMEN, cat: Category.BOTTOMS, title: "Klassik qara şalvar", brand: "Zara", size: "S", price: 4700 },
    { dep: Department.WOMEN, cat: Category.BOTTOMS, title: "Satin şort", brand: "Mango", size: "M", price: 3400 },
    { dep: Department.WOMEN, cat: Category.DRESSES, title: "İpək yay donu", brand: "Mango", size: "S", price: 7600 },
    { dep: Department.WOMEN, cat: Category.DRESSES, title: "Qara kokteyl donu", brand: "Zara", size: "M", price: 6900 },
    { dep: Department.WOMEN, cat: Category.DRESSES, title: "Çiçəkli midi don", brand: "H&M", size: "L", price: 4400 },
    { dep: Department.WOMEN, cat: Category.DRESSES, title: "Axşam ziyafət donu", brand: "Koton", size: "M", price: 8800 },
    { dep: Department.WOMEN, cat: Category.FOOTWEAR, title: "Dəri dabanlı ayaqqabı", brand: "Nine West", size: "38", price: 8200 },
    { dep: Department.WOMEN, cat: Category.FOOTWEAR, title: "Ağ sneaker", brand: "Adidas", size: "37", price: 8900 },
    { dep: Department.WOMEN, cat: Category.FOOTWEAR, title: "Uzun çəkmə", brand: "Aldo", size: "39", price: 13200 },
    { dep: Department.WOMEN, cat: Category.FOOTWEAR, title: "Baletka", brand: "Mango", size: "36", price: 3900 },
    { dep: Department.WOMEN, cat: Category.ACCESSORIES, title: "Dəri çanta", brand: "Furla", size: "One size", price: 14500 },
    { dep: Department.WOMEN, cat: Category.ACCESSORIES, title: "İpək şərf", brand: "Accessorize", size: "One size", price: 2300 },
    { dep: Department.WOMEN, cat: Category.ACTIVEWEAR, title: "Yoga legging", brand: "Nike", size: "S", price: 5200 },
    { dep: Department.WOMEN, cat: Category.ACTIVEWEAR, title: "İdman bra top", brand: "Oysho", size: "M", price: 3300 },
    { dep: Department.WOMEN, cat: Category.OTHER, title: "Ev geyimi dəsti", brand: "Penti", size: "M", price: 4100 },
    { dep: Department.KIDS, cat: Category.OUTERWEAR, title: "Uşaq qış gödəkçəsi", brand: "LC Waikiki", size: "5-6 yaş", price: 3900 },
    { dep: Department.KIDS, cat: Category.OUTERWEAR, title: "Qız uşaq trençkot", brand: "Zara Kids", size: "7-8 yaş", price: 5200 },
    { dep: Department.KIDS, cat: Category.OUTERWEAR, title: "Oğlan puffer jilet", brand: "H&M Kids", size: "9-10 yaş", price: 3400 },
    { dep: Department.KIDS, cat: Category.OUTERWEAR, title: "Uşaq yağmurluğu", brand: "Mothercare", size: "4-5 yaş", price: 2700 },
    { dep: Department.KIDS, cat: Category.TOPS, title: "Cizgili uşaq sviteri", brand: "Zara Kids", size: "6 yaş", price: 2400 },
    { dep: Department.KIDS, cat: Category.TOPS, title: "Superhero tişört", brand: "H&M Kids", size: "8 yaş", price: 1200 },
    { dep: Department.KIDS, cat: Category.TOPS, title: "Pambıq uşaq köynəyi", brand: "LC Waikiki", size: "10 yaş", price: 1800 },
    { dep: Department.KIDS, cat: Category.TOPS, title: "Kapüşonlu hoodie", brand: "Koton Kids", size: "7 yaş", price: 2600 },
    { dep: Department.KIDS, cat: Category.BOTTOMS, title: "Uşaq cins şalvarı", brand: "Zara Kids", size: "8 yaş", price: 2900 },
    { dep: Department.KIDS, cat: Category.BOTTOMS, title: "Məktəb şalvarı", brand: "LC Waikiki", size: "9 yaş", price: 2200 },
    { dep: Department.KIDS, cat: Category.BOTTOMS, title: "Qız uşaq ətəyi", brand: "Koton Kids", size: "6 yaş", price: 1700 },
    { dep: Department.KIDS, cat: Category.BOTTOMS, title: "Uşaq jogger", brand: "H&M Kids", size: "10 yaş", price: 2100 },
    { dep: Department.KIDS, cat: Category.DRESSES, title: "Qız uşaq bayram donu", brand: "Zara Kids", size: "5 yaş", price: 4600 },
    { dep: Department.KIDS, cat: Category.DRESSES, title: "Çiçəkli uşaq donu", brand: "Mothercare", size: "7 yaş", price: 3100 },
    { dep: Department.KIDS, cat: Category.DRESSES, title: "Tül ətəkli don", brand: "LC Waikiki", size: "6 yaş", price: 2800 },
    { dep: Department.KIDS, cat: Category.FOOTWEAR, title: "Uşaq Nike sneaker", brand: "Nike", size: "31", price: 6200 },
    { dep: Department.KIDS, cat: Category.FOOTWEAR, title: "Məktəb ayaqqabısı", brand: "Clarks", size: "33", price: 5400 },
    { dep: Department.KIDS, cat: Category.FOOTWEAR, title: "Uşaq sandalı", brand: "Geox", size: "29", price: 3600 },
    { dep: Department.KIDS, cat: Category.FOOTWEAR, title: "Adidas uşaq krossovkası", brand: "Adidas", size: "32", price: 5800 },
    { dep: Department.KIDS, cat: Category.ACCESSORIES, title: "Məktəb çantası", brand: "Samsonite", size: "One size", price: 6500 },
    { dep: Department.KIDS, cat: Category.ACCESSORIES, title: "Uşaq papağı və şərfi", brand: "H&M Kids", size: "One size", price: 1600 },
    { dep: Department.KIDS, cat: Category.ACTIVEWEAR, title: "Uşaq futbol forması", brand: "Nike", size: "8 yaş", price: 4200 },
    { dep: Department.KIDS, cat: Category.ACTIVEWEAR, title: "Uşaq idman dəsti", brand: "Adidas", size: "9 yaş", price: 4800 },
    { dep: Department.KIDS, cat: Category.OTHER, title: "Körpə tulumu", brand: "Mothercare", size: "12-18 ay", price: 1900 },
    { dep: Department.KIDS, cat: Category.OTHER, title: "Uşaq pijama dəsti", brand: "Penti Kids", size: "6 yaş", price: 2300 },
    { dep: Department.UNISEX, cat: Category.OUTERWEAR, title: "Oversize cins gödəkçə", brand: "Levi's", size: "M", price: 7900 },
    { dep: Department.UNISEX, cat: Category.OUTERWEAR, title: "Kapüşonlu küləkkeçirməz", brand: "Columbia", size: "L", price: 9200 },
    { dep: Department.UNISEX, cat: Category.OUTERWEAR, title: "Vintage varsity jacket", brand: "Champion", size: "XL", price: 8700 },
    { dep: Department.UNISEX, cat: Category.OUTERWEAR, title: "Minimal qara palto", brand: "COS", size: "M", price: 11800 },
    { dep: Department.UNISEX, cat: Category.TOPS, title: "Oversize hoodie", brand: "Nike", size: "L", price: 6800 },
    { dep: Department.UNISEX, cat: Category.TOPS, title: "Ağ basic tişört", brand: "Uniqlo", size: "M", price: 1500 },
    { dep: Department.UNISEX, cat: Category.TOPS, title: "Qrafik sweatshirt", brand: "Pull&Bear", size: "S", price: 3400 },
    { dep: Department.UNISEX, cat: Category.TOPS, title: "Trikotaj bej sviter", brand: "Reserved", size: "L", price: 4600 },
    { dep: Department.UNISEX, cat: Category.BOTTOMS, title: "Relaxed fit cins", brand: "Weekday", size: "30", price: 5900 },
    { dep: Department.UNISEX, cat: Category.BOTTOMS, title: "Geniş jogger", brand: "Adidas", size: "M", price: 4300 },
    { dep: Department.UNISEX, cat: Category.BOTTOMS, title: "Kətan şort", brand: "H&M", size: "L", price: 2500 },
    { dep: Department.UNISEX, cat: Category.BOTTOMS, title: "Utility kargo", brand: "Carhartt", size: "M", price: 9600 },
    { dep: Department.UNISEX, cat: Category.FOOTWEAR, title: "Converse Chuck 70", brand: "Converse", size: "40", price: 8800 },
    { dep: Department.UNISEX, cat: Category.FOOTWEAR, title: "Vans Old Skool", brand: "Vans", size: "39", price: 7600 },
    { dep: Department.UNISEX, cat: Category.FOOTWEAR, title: "New Balance 574", brand: "New Balance", size: "42", price: 11200 },
    { dep: Department.UNISEX, cat: Category.FOOTWEAR, title: "Birkenstock sandal", brand: "Birkenstock", size: "41", price: 9900 },
    { dep: Department.UNISEX, cat: Category.ACCESSORIES, title: "Kanvas tote çanta", brand: "COS", size: "One size", price: 2600 },
    { dep: Department.UNISEX, cat: Category.ACCESSORIES, title: "Beanie papaq", brand: "Carhartt", size: "One size", price: 3200 },
    { dep: Department.UNISEX, cat: Category.ACTIVEWEAR, title: "Qaçış gödəkçəsi", brand: "Puma", size: "M", price: 5700 },
    { dep: Department.UNISEX, cat: Category.ACTIVEWEAR, title: "Dri-fit məşq tişörtü", brand: "Nike", size: "L", price: 3500 },
    { dep: Department.UNISEX, cat: Category.ACCESSORIES, title: "Sport bel çantası", brand: "Adidas", size: "One size", price: 3800 },
    { dep: Department.UNISEX, cat: Category.OTHER, title: "Rahat ev slippers", brand: "Oysho", size: "40", price: 2700 },
    { dep: Department.UNISEX, cat: Category.OTHER, title: "Minimalist corab dəsti", brand: "Uniqlo", size: "One size", price: 1200 },
    { dep: Department.UNISEX, cat: Category.TOPS, title: "Vintage college sweatshirt", brand: "Champion", size: "M", price: 4900 },
    { dep: Department.UNISEX, cat: Category.ACCESSORIES, title: "Gün eynəyi", brand: "Ray-Ban", size: "One size", price: 12500 },
    { dep: Department.UNISEX, cat: Category.FOOTWEAR, title: "Dr. Martens bot", brand: "Dr. Martens", size: "41", price: 15800 },
  ] : []) satisfies Omit<Seed, "owner" | "desc" | "cond" | "city" | "state" | "promo">[];

  const cities = ["Bakı", "Gəncə", "Sumqayıt", "Şəki", "Lənkəran", "Mingəçevir"];
  const listings: Seed[] = catalog.map((item, index) => ({
    ...item,
    owner: index % 5 === 0 ? regular.id : storeUser.id,
    desc: `${item.brand} ${item.title.toLowerCase()}. Təmiz saxlanılıb, gündəlik istifadə və mağaza vitrini üçün uyğundur.`,
    cond: index % 3 === 0 ? Condition.NEW : Condition.USED,
    city: cities[index % cities.length],
    negotiable: index % 4 === 0,
    state: ListingState.ACTIVE,
    promo:
      index % 10 === 0
        ? PromotionTier.DIAMOND
        : index % 7 === 0
          ? PromotionTier.VIP
          : undefined,
  }));

  let i = 0;
  for (const l of listings) {
    i += 1;
    await prisma.listing.create({
      data: {
        ownerId: l.owner,
        title: l.title,
        description: l.desc,
        department: l.dep,
        category: l.cat,
        brand: l.brand,
        condition: l.cond,
        priceMinor: l.price,
        negotiable: l.negotiable ?? false,
        city: l.city,
        contactPhone: "+994501112233",
        size: l.size,
        state: l.state,
        approvedAt:
          l.state === ListingState.ACTIVE || l.state === ListingState.SOLD
            ? new Date()
            : null,
        images: {
          create: [
            {
              url: `https://placehold.co/600x800/png?text=${encodeURIComponent(l.title)}`,
              position: 0,
            },
            { url: img(`clothing-${i}-${l.dep.toLowerCase()}`), position: 1 },
          ],
        },
        promotions: l.promo
          ? { create: { tier: l.promo, expiresAt: daysFromNow(15) } }
          : undefined,
      },
    });
  }

  // Active homepage Top Stores slot for the seeded store.
  if (storeUser.storeProfile) {
    await prisma.storeAd.create({
      data: {
        storeProfileId: storeUser.storeProfile.id,
        expiresAt: daysFromNow(STORE_AD_DURATION_DAYS),
      },
    });
    await prisma.payment.create({
      data: {
        userId: storeUser.id,
        kind: "STORE_AD",
        amountMinor: STORE_AD_PRICE_MINOR,
        status: "PAID",
      },
    });
  }

  console.log("Seed complete:");
  console.log("  admin@paltar.az / admin1234 (ADMIN)");
  console.log("  store@paltar.az / store1234 (STORE)");
  console.log("  user@paltar.az  / user1234  (REGULAR)");
  console.log(`  listings: ${listings.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
