import Link from "next/link";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-bold text-brand-600">{tc("appName")}</span>
          <span className="ml-2">{tc("tagline")}</span>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/about" className="hover:text-zinc-900">{t("about")}</Link>
          <Link href="/terms" className="hover:text-zinc-900">{t("terms")}</Link>
          <Link href="/privacy" className="hover:text-zinc-900">{t("privacy")}</Link>
          <Link href="/contact" className="hover:text-zinc-900">{t("contact")}</Link>
        </nav>
      </div>
      <div className="border-t border-zinc-100 py-4 text-center text-xs text-zinc-400">
        {t("copyright", { year })}
      </div>
    </footer>
  );
}
