import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth-helpers";
import { AuthTabs } from "@/components/auth/auth-tabs";
import type { AccountType } from "@/lib/validations/auth";

export const metadata: Metadata = { title: "Daxil ol" };

type PageProps = {
  searchParams: Promise<{ type?: string }>;
};

function accountTypeFromParam(value?: string): AccountType {
  return value === "business" ? "business" : "individual";
}

export default async function LoginPage({ searchParams }: PageProps) {
  if (await getCurrentUser()) redirect("/account");

  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">Daxil ol</h1>
        <Suspense fallback={null}>
          <AuthTabs mode="login" initialAccountType={accountTypeFromParam(params.type)} />
        </Suspense>
      </div>
    </div>
  );
}
