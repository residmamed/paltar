import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth-helpers";
import { AuthTabs } from "@/components/auth/auth-tabs";

export const metadata: Metadata = { title: "Qeydiyyat" };

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/account");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold">Qeydiyyat</h1>
        <p className="mb-6 text-center text-sm text-zinc-500">
          E-poçt və ya telefon nömrəsi ilə qeydiyyatdan keçin.
        </p>
        <AuthTabs mode="register" />
      </div>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Artıq hesabınız var?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Daxil olun
        </Link>
      </p>
    </div>
  );
}
