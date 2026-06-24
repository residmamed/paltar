"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { requestOtp } from "@/lib/otp";
import { normalizePhone } from "@/lib/phone";
import { formStateOnDatabaseUnavailable } from "@/lib/prisma-errors";
import { ensureUniqueStoreSlug } from "@/lib/store-slug";
import {
  accountTypeSchema,
  businessEmailRegisterSchema,
  emailLoginSchema,
  emailRegisterSchema,
  phoneRequestSchema,
  phoneVerifySchema,
  storeNameSchema,
  type AccountType,
} from "@/lib/validations/auth";

export type FormState = { error?: string; ok?: boolean; info?: string };

const DEFAULT_REDIRECT = "/account";

function parseAccountType(raw: FormDataEntryValue | null): AccountType {
  const parsed = accountTypeSchema.safeParse(raw);
  return parsed.success ? parsed.data : "individual";
}

function roleMatchesAccountType(role: Role, accountType: AccountType): boolean {
  if (accountType === "business") return role === Role.STORE;
  return role === Role.REGULAR || role === Role.ADMIN;
}

function accountTypeMismatchError(accountType: AccountType): string {
  return accountType === "business"
    ? "Bu hesab fərdi hesabdır. Fərdi girişindən istifadə edin."
    : "Bu hesab mağaza hesabıdır. Mağaza girişindən istifadə edin.";
}

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
  return formStateOnDatabaseUnavailable(async () => {
    const accountType = parseAccountType(formData.get("accountType"));

    if (accountType === "business") {
      const parsed = businessEmailRegisterSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        displayName: formData.get("displayName") || undefined,
        storeName: formData.get("storeName"),
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Yanlış məlumat" };
      }

      const { email, password, displayName, storeName } = parsed.data;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return { error: "Bu e-poçt artıq qeydiyyatdan keçib" };
      }

      const slug = await ensureUniqueStoreSlug(storeName);
      await prisma.user.create({
        data: {
          email,
          passwordHash: await hashPassword(password),
          displayName: displayName ?? storeName,
          role: Role.STORE,
          storeProfile: {
            create: { name: storeName, slug },
          },
        },
      });

      await signIn("password", { email, password, redirectTo: DEFAULT_REDIRECT });
      return { ok: true };
    }

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
  });
}

export async function loginWithEmail(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return formStateOnDatabaseUnavailable(async () => {
    const accountType = parseAccountType(formData.get("accountType"));
    const parsed = emailLoginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      return { error: "E-poçt və ya şifrə yanlışdır" };
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !user.passwordHash || user.bannedAt) {
      return { error: "E-poçt və ya şifrə yanlışdır" };
    }
    if (!roleMatchesAccountType(user.role, accountType)) {
      return { error: accountTypeMismatchError(accountType) };
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
  });
}

// ---------------------------------------------------------------------------
// Phone (OTP)
// ---------------------------------------------------------------------------

export async function sendPhoneOtp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return formStateOnDatabaseUnavailable(async () => {
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
  });
}

export async function verifyPhoneOtp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return formStateOnDatabaseUnavailable(async () => {
    const accountType = parseAccountType(formData.get("accountType"));
    const authMode = formData.get("authMode") === "register" ? "register" : "login";
    const storeNameRaw = formData.get("storeName");

    if (authMode === "register" && accountType === "business") {
      const storeParsed = storeNameSchema.safeParse(storeNameRaw);
      if (!storeParsed.success) {
        return { error: storeParsed.error.issues[0]?.message ?? "Mağaza adı yanlışdır" };
      }
    }

    const parsed = phoneVerifySchema.safeParse({
      phone: formData.get("phone"),
      code: formData.get("code"),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Yanlış kod" };
    }

    const phone = normalizePhone(parsed.data.phone);
    if (!phone) {
      return { error: "Düzgün telefon nömrəsi daxil edin" };
    }

    if (authMode === "login") {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (!existing || existing.bannedAt) {
        return { error: "Bu telefon nömrəsi ilə hesab tapılmadı" };
      }
      if (!roleMatchesAccountType(existing.role, accountType)) {
        return { error: accountTypeMismatchError(accountType) };
      }
    }

    try {
      await signIn("phone-otp", {
        phone: parsed.data.phone,
        code: parsed.data.code,
        authMode,
        accountType,
        storeName: typeof storeNameRaw === "string" ? storeNameRaw : undefined,
        redirectTo: DEFAULT_REDIRECT,
      });
      return { ok: true };
    } catch (error) {
      if (error instanceof AuthError) {
        return { error: "Kod yanlış və ya vaxtı keçib" };
      }
      throw error;
    }
  });
}
