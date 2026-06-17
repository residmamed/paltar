"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { EmailLoginForm } from "./email-login-form";
import { EmailRegisterForm } from "./email-register-form";
import { PhoneForm } from "./phone-form";

export function AuthTabs({ mode }: { mode: "login" | "register" }) {
  const [tab, setTab] = useState<"email" | "phone">("email");

  return (
    <div>
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
          <EmailLoginForm />
        ) : (
          <EmailRegisterForm />
        )
      ) : (
        <PhoneForm />
      )}
    </div>
  );
}
