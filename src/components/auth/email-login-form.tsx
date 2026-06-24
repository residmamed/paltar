"use client";

import { useActionState } from "react";
import { loginWithEmail, type FormState } from "@/app/(auth)/actions";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import type { AccountType } from "@/lib/validations/auth";

const initial: FormState = {};

export function EmailLoginForm({ accountType }: { accountType: AccountType }) {
  const [state, action] = useActionState(loginWithEmail, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="accountType" value={accountType} />
      {state.error && <Alert>{state.error}</Alert>}
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
          autoComplete="current-password"
          required
        />
      </div>
      <SubmitButton className="w-full" size="lg">
        Daxil ol
      </SubmitButton>
    </form>
  );
}
