"use client";

import { useActionState } from "react";
import { registerWithEmail, type FormState } from "@/app/(auth)/actions";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import type { AccountType } from "@/lib/validations/auth";

const initial: FormState = {};

export function EmailRegisterForm({ accountType }: { accountType: AccountType }) {
  const [state, action] = useActionState(registerWithEmail, initial);
  const isBusiness = accountType === "business";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="accountType" value={accountType} />
      {state.error && <Alert>{state.error}</Alert>}
      {isBusiness && (
        <div>
          <Label htmlFor="storeName">Mağaza adı</Label>
          <Input id="storeName" name="storeName" autoComplete="organization" required />
        </div>
      )}
      <div>
        <Label htmlFor="displayName">{isBusiness ? "Əlaqədar şəxs (istəyə bağlı)" : "Ad (istəyə bağlı)"}</Label>
        <Input id="displayName" name="displayName" autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="email">E-poçt</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Şifrə</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <p className="mt-1 text-xs text-zinc-500">Ən azı 8 simvol.</p>
      </div>
      <SubmitButton className="w-full" size="lg">
        {isBusiness ? "Mağaza hesabı yarat" : "Qeydiyyatdan keç"}
      </SubmitButton>
    </form>
  );
}
