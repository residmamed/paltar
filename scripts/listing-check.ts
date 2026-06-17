import "dotenv/config";
import { prisma } from "@/lib/db";
import { hasFreeSlot, countCommittedListings, isContentChanged } from "@/lib/listings";
import { parsePriceToMinor } from "@/lib/validations/listing";
import { ListingState, Role, Department, Category, Condition } from "@/generated/prisma/enums";

function assert(c: boolean, m: string) { if (!c) { console.error("FAIL:", m); process.exit(1); } console.log("ok:", m); }

async function main() {
  // price parsing
  assert(parsePriceToMinor("45") === 4500, "parse 45 -> 4500");
  assert(parsePriceToMinor("45.50") === 4550, "parse 45.50 -> 4550");
  assert(parsePriceToMinor("45,5") === 4550, "parse 45,5 -> 4550");
  assert(parsePriceToMinor("abc") === null, "parse abc -> null");
  assert(parsePriceToMinor("1.999") === null, "parse 1.999 -> null (too many decimals)");

  const user = await prisma.user.findUniqueOrThrow({ where: { email: "user@paltar.az" } });
  const reg = { id: user.id, role: Role.REGULAR };
  const before = await countCommittedListings(user.id);
  console.log("seeded committed (PENDING+ACTIVE):", before);

  // Fill up to the limit with PENDING listings
  const created: string[] = [];
  while (await hasFreeSlot(reg)) {
    const l = await prisma.listing.create({ data: {
      ownerId: user.id, title: "TEST slot", description: "test description here",
      department: Department.MEN, category: Category.TOPS, condition: Condition.USED,
      priceMinor: 1000, city: "Bakı", contactPhone: "+994500000000", size: "M",
      state: ListingState.PENDING,
    }});
    created.push(l.id);
  }
  const atLimit = await countCommittedListings(user.id);
  assert(atLimit === 5, `regular user capped at 5 committed (got ${atLimit})`);
  assert(!(await hasFreeSlot(reg)), "no free slot at limit");

  // Store/admin unlimited
  assert(await hasFreeSlot({ id: user.id, role: Role.STORE }), "store has free slot regardless");

  // isContentChanged
  const current = {
    title: "A", description: "B", department: "MEN", category: "TOPS", condition: "USED",
    brand: null as string | null, size: "M", city: "Bakı", contactPhone: "+994500000000",
    images: [{ url: "u1" }, { url: "u2" }],
  };
  const base = { title:"A", description:"B", department:"MEN" as const, category:"TOPS" as const, condition:"USED" as const, brand: undefined, size:"M", priceMinor: 1000, negotiable:false, city:"Bakı", contactPhone:"+994500000000", images:["u1","u2"] };
  assert(isContentChanged(current, { ...base }) === false, "no change detected when identical");
  assert(isContentChanged(current, { ...base, priceMinor: 9999, negotiable: true }) === false, "price/negotiable only -> NOT content change");
  assert(isContentChanged(current, { ...base, title: "X" }) === true, "title change -> content change");
  assert(isContentChanged(current, { ...base, images: ["u2","u1"] }) === true, "image reorder -> content change");
  assert(isContentChanged(current, { ...base, images: ["u1"] }) === true, "image removal -> content change");

  // cleanup
  await prisma.listing.deleteMany({ where: { id: { in: created } } });
  console.log("\nALL LISTING CHECKS PASSED");
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
