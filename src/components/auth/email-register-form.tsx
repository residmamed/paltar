"use client";

import { useActionState } from "react";
import { registerWithEmail, type FormState } from "@/app/(auth)/actions";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: FormState = {};

export function EmailRegisterForm() {
  const [state, action] = useActionState(registerWithEmail, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert>{state.error}</Alert>}
      <div>
        <Label htmlFor="displayName">Ad (istəyə bağlı)</Label>
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
        Qeydiyyatdan keç
      </SubmitButton>
    </form>
  );
}
