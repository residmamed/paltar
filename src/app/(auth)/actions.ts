"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { requestOtp } from "@/lib/otp";
import { normalizePhone } from "@/lib/phone";
import {
  emailLoginSchema,
  emailRegisterSchema,
  phoneRequestSchema,
  phoneVerifySchema,
} from "@/lib/validations/auth";

export type FormState = { error?: string; ok?: boolean; info?: string };

const DEFAULT_REDIRECT = "/account";

export async function logout() {
  await signOut({ redirectTo: "/" });
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

export async function registerWithEmail(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = emailRegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Yanlış məlumat" };
  }

  const { email, password, displayName } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Bu e-poçt artıq qeydiyyatdan keçib" };
  }

  await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password), displayName },
  });

  await signIn("password", { email, password, redirectTo: DEFAULT_REDIRECT });
  return { ok: true };
}

export async function loginWithEmail(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = emailLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "E-poçt və ya şifrə yanlışdır" };
  }

  try {
    await signIn("password", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: DEFAULT_REDIRECT,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-poçt və ya şifrə yanlışdır" };
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Phone (OTP)
// ---------------------------------------------------------------------------

export async function sendPhoneOtp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = phoneRequestSchema.safeParse({ phone: formData.get("phone") });
  if (!parsed.success) {
    return { error: "Düzgün telefon nömrəsi daxil edin" };
  }
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return { error: "Düzgün telefon nömrəsi daxil edin" };
  }

  const result = await requestOtp(phone);
  if (!result.ok) {
    return {
      error: `Çox tez-tez cəhd edirsiniz. ${result.retryAfterSec} saniyə sonra yenidən cəhd edin.`,
    };
  }
  return { ok: true, info: "Təsdiq kodu göndərildi" };
}

export async function verifyPhoneOtp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = phoneVerifySchema.safeParse({
    phone: formData.get("phone"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Yanlış kod" };
  }

  try {
    await signIn("phone-otp", {
      phone: parsed.data.phone,
      code: parsed.data.code,
      redirectTo: DEFAULT_REDIRECT,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Kod yanlış və ya vaxtı keçib" };
    }
    throw error;
  }
}
