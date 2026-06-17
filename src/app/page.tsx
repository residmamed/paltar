import Link from "next/link";
import { useTranslations } from "next-intl";
import { DEPARTMENTS, CATEGORIES } from "@/lib/constants";

export default function Home() {
  const th = useTranslations("home");
  const td = useTranslations("department");
  const tcat = useTranslations("category");
  const tc = useTranslations("common");

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-12 sm:py-16">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-12 text-white sm:px-12 sm:py-16">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            {th("heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-brand-100">{th("heroSubtitle")}</p>
          <form action="/search" className="mt-8 flex max-w-lg gap-2">
            <input
              type="search"
              name="q"
              placeholder={th("searchPlaceholder")}
              className="flex-1 rounded-full px-5 py-3 text-zinc-900 outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800"
            >
              {tc("search")}
            </button>
          </form>
        </div>
      </section>

      {/* Departments */}
      <section className="py-6">
        <h2 className="mb-4 text-lg font-semibold">{th("browseByDepartment")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DEPARTMENTS.map((dep) => (
            <Link
              key={dep}
              href={`/search?department=${dep}`}
              className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center font-medium text-zinc-800 transition hover:border-brand-500 hover:text-brand-600"
            >
              {td(dep)}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/search?category=${cat}`}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:border-brand-500 hover:text-brand-600"
            >
              {tcat(cat)}
            </Link>
          ))}
        </div>
      </section>

      {/* Data-driven sections wired up in later phases (promotions, recommended). */}
      <PlaceholderSection title={th("topStores")} />
      <PlaceholderSection title={th("diamondListings")} />
      <PlaceholderSection title={th("recommended")} />
    </div>
  );
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <section className="py-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-zinc-300 text-sm text-zinc-400">
        —
      </div>
    </section>
  );
}
