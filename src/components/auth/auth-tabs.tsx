"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/lib/validations/auth";
import { EmailLoginForm } from "./email-login-form";
import { EmailRegisterForm } from "./email-register-form";
import { PhoneForm } from "./phone-form";

type AuthTabsProps = {
  mode: "login" | "register";
  initialAccountType?: AccountType;
};

function accountTypeFromParam(value: string | null): AccountType {
  return value === "business" ? "business" : "individual";
}

export function AuthTabs({ mode, initialAccountType = "individual" }: AuthTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountType = accountTypeFromParam(searchParams.get("type") ?? initialAccountType);
  const [tab, setTab] = useState<"email" | "phone">("email");

  function setAccountType(next: AccountType) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "business") params.set("type", "business");
    else params.delete("type");
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  const crossLinkHref =
    mode === "login"
      ? accountType === "business"
        ? "/register?type=business"
        : "/register"
      : accountType === "business"
        ? "/login?type=business"
        : "/login";

  return (
    <div>
      <p className="mb-4 text-center text-sm text-zinc-500">
        {mode === "login"
          ? accountType === "business"
            ? "Mağaza hesabınıza daxil olun."
            : "Fərdi hesabınıza daxil olun."
          : accountType === "business"
            ? "Mağaza hesabı yaradın və vitrininizi idarə edin."
            : "Fərdi hesab yaradın və elan yerləşdirin."}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setAccountType("individual")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition",
            accountType === "individual"
              ? "border-brand-500 bg-brand-50 text-brand-900"
              : "border-zinc-200 text-zinc-600 hover:border-zinc-300",
          )}
        >
          <User className="size-5" />
          <span className="font-medium">Fərdi</span>
          <span className="text-xs text-zinc-500">Elan yerləşdir və al</span>
        </button>
        <button
          type="button"
          onClick={() => setAccountType("business")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition",
            accountType === "business"
              ? "border-brand-500 bg-brand-50 text-brand-900"
              : "border-zinc-200 text-zinc-600 hover:border-zinc-300",
          )}
        >
          <Building2 className="size-5" />
          <span className="font-medium">Mağaza</span>
          <span className="text-xs text-zinc-500">Mağaza vitrinin idarə et</span>
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 rounded-full bg-zinc-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setTab("email")}
          className={cn(
            "rounded-full py-2 transition",
            tab === "email" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500",
          )}
        >
          E-poçt
        </button>
        <button
          type="button"
          onClick={() => setTab("phone")}
          className={cn(
            "rounded-full py-2 transition",
            tab === "phone" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500",
          )}
        >
          Telefon
        </button>
      </div>

      {tab === "email" ? (
        mode === "login" ? (
          <EmailLoginForm accountType={accountType} />
        ) : (
          <EmailRegisterForm accountType={accountType} />
        )
      ) : (
        <PhoneForm mode={mode} accountType={accountType} />
      )}

      <p className="mt-6 text-center text-sm text-zinc-500">
        {mode === "login" ? (
          <>
            Hesabınız yoxdur?{" "}
            <Link href={crossLinkHref} className="font-medium text-brand-600 hover:underline">
              Qeydiyyatdan keçin
            </Link>
          </>
        ) : (
          <>
            Artıq hesabınız var?{" "}
            <Link href={crossLinkHref} className="font-medium text-brand-600 hover:underline">
              Daxil olun
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
