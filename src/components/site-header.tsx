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
    <header className="sticky top-0 z-40 border-b border-dashed border-[#C9C2B4] bg-[#F3EEE4]/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="font-display shrink-0 text-xl tracking-normal text-[#2F3A8F] outline-none focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4]"
        >
          {tc("appName")}
        </Link>

        <form action="/search" className="hidden flex-1 sm:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#2F3A8F]" />
            <input
              type="search"
              name="q"
              placeholder={th("searchPlaceholder")}
              className="font-tag w-full border border-dashed border-[#C9C2B4] bg-[#FFF9ED] py-2 pl-9 pr-4 text-xs text-[#241F1C] outline-none placeholder:text-[#7B7064] focus:border-[#2F3A8F] focus:ring-2 focus:ring-[#2F3A8F]/20"
            />
          </div>
        </form>

        <nav className="flex shrink-0 items-center gap-1 text-sm font-medium">
          <Link
            href="/listings/new"
            className="torn-button inline-flex items-center gap-1 bg-[#D89B3C] px-3 py-2 text-[#241F1C] outline-none transition hover:-translate-y-0.5 hover:bg-[#C9892E] focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4]"
          >
            <Plus className="size-4" />
            <span className="hidden md:inline">{t("sell")}</span>
          </Link>
          <Link
            href="/stores"
            className="hidden px-3 py-2 text-[#241F1C] underline decoration-[#C9C2B4] decoration-dashed underline-offset-4 outline-none hover:text-[#2F3A8F] focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4] md:inline-block"
          >
            {t("stores")}
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            className="inline-flex items-center gap-1 px-3 py-2 text-[#241F1C] outline-none hover:text-[#2F3A8F] focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3EEE4]"
          >
            <UserIcon className="size-4" />
            <span className="hidden sm:inline">{t("account")}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
