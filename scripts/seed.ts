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

  const admin = await prisma.user.create({
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
    state: ListingState;
    promo?: PromotionTier;
  };

  const listings: Seed[] = [
    { owner: storeUser.id, title: "Levi's 501 cins şalvar", desc: "Orijinal, az geyilib.", dep: Department.MEN, cat: Category.BOTTOMS, cond: Condition.USED, price: 4500, city: "Bakı", state: ListingState.ACTIVE, promo: PromotionTier.DIAMOND },
    { owner: storeUser.id, title: "Zara qadın paltosu", desc: "Yun qarışıq, M ölçü.", dep: Department.WOMEN, cat: Category.OUTERWEAR, cond: Condition.USED, price: 8000, city: "Bakı", state: ListingState.ACTIVE, promo: PromotionTier.VIP },
    { owner: storeUser.id, title: "Nike Air Force 1", desc: "42 ölçü, təmiz.", dep: Department.UNISEX, cat: Category.FOOTWEAR, cond: Condition.USED, price: 12000, city: "Bakı", state: ListingState.ACTIVE, promo: PromotionTier.VIP },
    { owner: storeUser.id, title: "İpək yay donu", desc: "Yeni, etiketli.", dep: Department.WOMEN, cat: Category.DRESSES, cond: Condition.NEW, price: 6000, city: "Gəncə", state: ListingState.ACTIVE },
    { owner: storeUser.id, title: "Uşaq qış gödəkçəsi", desc: "5-6 yaş.", dep: Department.KIDS, cat: Category.OUTERWEAR, cond: Condition.USED, price: 2500, city: "Bakı", state: ListingState.ACTIVE },
    { owner: storeUser.id, title: "Adidas idman dəsti", desc: "L ölçü.", dep: Department.MEN, cat: Category.ACTIVEWEAR, cond: Condition.NEW, price: 5500, city: "Sumqayıt", state: ListingState.PENDING },
    { owner: regular.id, title: "Pambıq tişört", desc: "Bir-iki dəfə geyilib.", dep: Department.MEN, cat: Category.TOPS, cond: Condition.USED, price: 800, city: "Bakı", state: ListingState.ACTIVE },
    { owner: regular.id, title: "Dəri çanta", desc: "Həqiqi dəri.", dep: Department.WOMEN, cat: Category.ACCESSORIES, cond: Condition.USED, price: 3500, city: "Bakı", state: ListingState.ACTIVE },
    { owner: regular.id, title: "Qadın bluzası", desc: "S ölçü.", dep: Department.WOMEN, cat: Category.TOPS, cond: Condition.USED, price: 1200, city: "Bakı", state: ListingState.INACTIVE },
    { owner: regular.id, title: "Köhnə cins gödəkçə", desc: "Satıldı.", dep: Department.UNISEX, cat: Category.OUTERWEAR, cond: Condition.USED, price: 2000, city: "Bakı", state: ListingState.SOLD },
    { owner: regular.id, title: "Qışlıq şərf", desc: "Yun.", dep: Department.UNISEX, cat: Category.ACCESSORIES, cond: Condition.NEW, price: 500, city: "Bakı", state: ListingState.PENDING },
  ];

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
        condition: l.cond,
        priceMinor: l.price,
        city: l.city,
        contactPhone: "+994501112233",
        size: "M",
        state: l.state,
        approvedAt:
          l.state === ListingState.ACTIVE || l.state === ListingState.SOLD
            ? new Date()
            : null,
        images: {
          create: [
            { url: img(`l${i}a`), position: 0 },
            { url: img(`l${i}b`), position: 1 },
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
