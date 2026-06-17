import { randomInt } from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendSms } from "@/lib/sms";
import { OtpPurpose } from "@/generated/prisma/enums";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

export type OtpRequestResult =
  | { ok: true; expiresAt: Date }
  | { ok: false; error: "cooldown"; retryAfterSec: number };

/** Generate, store (hashed) and send a one-time code for a phone number. */
export async function requestOtp(
  phone: string,
  purpose: OtpPurpose = OtpPurpose.LOGIN,
): Promise<OtpRequestResult> {
  // Enforce a resend cooldown based on the most recent live code.
  const recent = await prisma.otpCode.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const elapsed = Date.now() - recent.createdAt.getTime();
    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        error: "cooldown",
        retryAfterSec: Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000),
      };
    }
  }

  // Invalidate any outstanding codes for this phone.
  await prisma.otpCode.updateMany({
    where: { phone, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otpCode.create({
    data: { phone, codeHash, purpose, expiresAt },
  });

  await sendSms(phone, `Paltar təsdiq kodunuz: ${code}`);
  return { ok: true, expiresAt };
}

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; error: "expired" | "invalid" | "too_many_attempts" };

/** Verify a submitted code against the latest live code for a phone. */
export async function verifyOtp(phone: string, code: string): Promise<OtpVerifyResult> {
  const record = await prisma.otpCode.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, error: "invalid" };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, error: "expired" };
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, error: "too_many_attempts" };
  }

  const match = await verifyPassword(code, record.codeHash);
  if (!match) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "invalid" };
  }

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true };
}
