import "dotenv/config";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { requestOtp, verifyOtp } from "@/lib/otp";
import { hashPassword, verifyPassword } from "@/lib/password";
import { OtpPurpose } from "@/generated/prisma/enums";

function assert(cond: boolean, msg: string) {
  if (!cond) { console.error("FAIL:", msg); process.exit(1); }
  console.log("ok:", msg);
}

async function main() {
  // 1) phone normalization
  assert(normalizePhone("0501234567") === "+994501234567", "normalize 0501234567");
  assert(normalizePhone("+994 50 123 45 67") === "+994501234567", "normalize +994 spaced");
  assert(normalizePhone("994501234567") === "+994501234567", "normalize 994...");
  assert(normalizePhone("123") === null, "reject short number");

  const phone = "+994500000001";
  await prisma.otpCode.deleteMany({ where: { phone } });

  // 2) requestOtp ok, then cooldown
  const r1 = await requestOtp(phone, OtpPurpose.LOGIN);
  assert(r1.ok === true, "first requestOtp ok");
  const r2 = await requestOtp(phone, OtpPurpose.LOGIN);
  assert(r2.ok === false && r2.error === "cooldown", "second requestOtp hits cooldown");

  // 3) verify with a known code (inject a fresh hashed code)
  await prisma.otpCode.updateMany({ where: { phone, consumedAt: null }, data: { consumedAt: new Date() } });
  await prisma.otpCode.create({
    data: { phone, codeHash: await hashPassword("424242"), purpose: OtpPurpose.LOGIN, expiresAt: new Date(Date.now() + 60000) },
  });
  const bad = await verifyOtp(phone, "000000");
  assert(bad.ok === false && bad.error === "invalid", "wrong code rejected");
  const good = await verifyOtp(phone, "424242");
  assert(good.ok === true, "correct code accepted");
  const reuse = await verifyOtp(phone, "424242");
  assert(reuse.ok === false, "consumed code cannot be reused");

  // 4) password roundtrip
  const h = await hashPassword("supersecret");
  assert(await verifyPassword("supersecret", h), "password verifies");
  assert(!(await verifyPassword("wrong", h)), "wrong password rejected");

  await prisma.otpCode.deleteMany({ where: { phone } });
  console.log("\nALL AUTH CHECKS PASSED");
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
