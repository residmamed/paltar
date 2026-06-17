"use client";

import { useActionState, useEffect, useState } from "react";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  type FormState,
} from "@/app/(auth)/actions";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: FormState = {};

export function PhoneForm() {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [sendState, sendAction] = useActionState(sendPhoneOtp, initial);
  const [verifyState, verifyAction] = useActionState(verifyPhoneOtp, initial);

  useEffect(() => {
    if (sendState.ok) setStep("code");
  }, [sendState]);

  if (step === "phone") {
    return (
      <form action={sendAction} className="space-y-4">
        {sendState.error && <Alert>{sendState.error}</Alert>}
        <div>
          <Label htmlFor="phone">Telefon nömrəsi</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="+994 50 123 45 67"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <SubmitButton className="w-full" size="lg">
          Kod göndər
        </SubmitButton>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="space-y-4">
      {verifyState.error && <Alert>{verifyState.error}</Alert>}
      {sendState.info && <Alert variant="success">{sendState.info}</Alert>}
      <input type="hidden" name="phone" value={phone} />
      <div>
        <Label htmlFor="code">Təsdiq kodu</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          required
        />
        <p className="mt-1 text-xs text-zinc-500">{phone} nömrəsinə göndərildi.</p>
      </div>
      <SubmitButton className="w-full" size="lg">
        Təsdiqlə və daxil ol
      </SubmitButton>
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="w-full text-center text-sm text-zinc-500 hover:text-zinc-800"
      >
        Nömrəni dəyiş
      </button>
    </form>
  );
}
