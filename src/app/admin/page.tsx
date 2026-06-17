import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { ListingState } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "İcmal" };

export default async function AdminDashboardPage() {
  const grouped = await prisma.listing.groupBy({
    by: ["state"],
    _count: { _all: true },
  });
  const count = (state: ListingState) =>
    grouped.find((g) => g.state === state)?._count._all ?? 0;

  const pending = count(ListingState.PENDING);

  const stats: { label: string; value: number }[] = [
    { label: "Aktiv", value: count(ListingState.ACTIVE) },
    { label: "Rədd edilmiş", value: count(ListingState.REJECTED) },
    { label: "Deaktiv", value: count(ListingState.INACTIVE) },
    { label: "Satılmış", value: count(ListingState.SOLD) },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/listings?state=PENDING"
        className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-6 transition hover:bg-amber-100"
      >
        <div>
          <p className="text-sm font-medium text-amber-800">
            Yoxlama gözləyən elanlar
          </p>
          <p className="mt-1 text-3xl font-bold text-amber-900">{pending}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-800">
          Yoxla
          <ArrowRight className="size-4" />
        </span>
      </Link>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-zinc-200 bg-white p-4"
          >
            <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
            <p className="text-sm text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
