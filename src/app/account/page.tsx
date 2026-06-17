import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { logout } from "@/app/(auth)/actions";
import { LinkButton } from "@/components/ui/button";
import { Role } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Hesabım" };

const roleLabel: Record<Role, string> = {
  REGULAR: "İstifadəçi",
  STORE: "Mağaza",
  ADMIN: "Admin",
};

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hesabım</h1>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
          >
            <LogOut className="size-4" />
            Çıxış
          </button>
        </form>
      </div>

      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <Row label="Ad" value={user.displayName ?? "—"} />
        <Row label="E-poçt" value={user.email ?? "—"} />
        <Row label="Telefon" value={user.phone ?? "—"} />
        <Row label="Hesab növü" value={roleLabel[user.role]} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <LinkButton href="/listings/new">Elan yerləşdir</LinkButton>
        <LinkButton href="/account/listings" variant="outline">
          Mənim elanlarım
        </LinkButton>
        {user.role === Role.REGULAR && (
          <LinkButton href="/account/become-store" variant="outline">
            Mağaza ol
          </LinkButton>
        )}
        {user.role === Role.ADMIN && (
          <LinkButton href="/admin" variant="outline">
            İdarəetmə paneli
          </LinkButton>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-900">{value}</span>
    </div>
  );
}
