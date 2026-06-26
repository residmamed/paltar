"use client";

import { useActionState, useState } from "react";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  type FormState,
} from "@/app/(auth)/actions";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import type { AccountType } from "@/lib/validations/auth";

const initial: FormState = {};

type PhoneFormProps = {
  mode: "login" | "register";
  accountType: AccountType;
};

export function PhoneForm({ mode, accountType }: PhoneFormProps) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [sendState, setSendState] = useState<FormState>(initial);
  const [verifyState, verifyAction] = useActionState(verifyPhoneOtp, initial);
  const isBusinessRegister = mode === "register" && accountType === "business";

  async function sendAction(formData: FormData) {
    const nextState = await sendPhoneOtp(initial, formData);
    setSendState(nextState);
    if (nextState.ok) setStep("code");
  }

  if (step === "phone") {
    return (
      <form action={sendAction} className="space-y-4">
        {sendState.error && <Alert>{sendState.error}</Alert>}
        {isBusinessRegister && (
          <div>
            <Label htmlFor="storeName">Mağaza adı</Label>
            <Input
              id="storeName"
              name="storeName"
              autoComplete="organization"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>
        )}
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
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="accountType" value={accountType} />
      <input type="hidden" name="authMode" value={mode} />
      {isBusinessRegister && <input type="hidden" name="storeName" value={storeName} />}
      {verifyState.error && <Alert>{verifyState.error}</Alert>}
      {sendState.info && <Alert variant="success">{sendState.info}</Alert>}
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
        {mode === "register" ? "Qeydiyyatı tamamla" : "Təsdiqlə və daxil ol"}
      </SubmitButton>
      <button
        type="button"
        onClick={() => {
          setSendState(initial);
          setStep("phone");
        }}
        className="w-full text-center text-sm text-zinc-500 hover:text-zinc-800"
      >
        Nömrəni dəyiş
      </button>
    </form>
  );
}
