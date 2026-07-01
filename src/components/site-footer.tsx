import Link from "next/link";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-dashed border-[#C9C2B4] bg-[#E9DFC9]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[#6F665B] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-display text-[#2F3A8F]">{tc("appName")}</span>
          <span className="ml-2">{tc("tagline")}</span>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/about" className="outline-none hover:text-[#241F1C] focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#E9DFC9]">{t("about")}</Link>
          <Link href="/terms" className="outline-none hover:text-[#241F1C] focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#E9DFC9]">{t("terms")}</Link>
          <Link href="/privacy" className="outline-none hover:text-[#241F1C] focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#E9DFC9]">{t("privacy")}</Link>
          <Link href="/contact" className="outline-none hover:text-[#241F1C] focus-visible:ring-2 focus-visible:ring-[#2F3A8F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#E9DFC9]">{t("contact")}</Link>
        </nav>
      </div>
      <div className="border-t border-dashed border-[#C9C2B4] py-4 text-center text-xs text-[#7B7064]">
        {t("copyright", { year })}
      </div>
    </footer>
  );
}
