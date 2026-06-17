import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth-helpers";
import { AuthTabs } from "@/components/auth/auth-tabs";

export const metadata: Metadata = { title: "Daxil ol" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/account");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">Daxil ol</h1>
        <AuthTabs mode="login" />
      </div>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Hesabınız yoxdur?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:underline">
          Qeydiyyatdan keçin
        </Link>
      </p>
    </div>
  );
}
