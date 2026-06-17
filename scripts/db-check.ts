import "dotenv/config";
import { prisma } from "@/lib/db";
async function main() {
  const users = await prisma.user.count();
  const listings = await prisma.listing.count();
  console.log("DB OK — users:", users, "listings:", listings);
}
main().then(() => process.exit(0)).catch((e) => { console.error("DB FAIL:", e.message); process.exit(1); });
