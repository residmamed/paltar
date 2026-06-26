import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Search, Plus, User as UserIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function SiteHeader() {
  const [t, tc, th] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("home"),
  ]);
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-brand-600"
        >
          {tc("appName")}
        </Link>

        <form action="/search" className="hidden flex-1 sm:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              name="q"
              placeholder={th("searchPlaceholder")}
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>
        </form>

        <nav className="flex shrink-0 items-center gap-1 text-sm font-medium">
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-2 text-white hover:bg-brand-700"
          >
            <Plus className="size-4" />
            <span className="hidden md:inline">{t("sell")}</span>
          </Link>
          <Link
            href="/stores"
            className="hidden rounded-full px-3 py-2 text-zinc-700 hover:bg-zinc-100 md:inline-block"
          >
            {t("stores")}
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-zinc-700 hover:bg-zinc-100"
          >
            <UserIcon className="size-4" />
            <span className="hidden sm:inline">{t("account")}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
