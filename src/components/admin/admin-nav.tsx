"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "İcmal", exact: true },
  { href: "/admin/listings", label: "Elan yoxlaması", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b border-zinc-200">
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition",
              active
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-zinc-500 hover:text-zinc-800",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
      <Link
        href="/listings/new"
        className="ml-auto -mb-px inline-flex items-center gap-1 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800"
      >
        <Plus className="size-4" />
        Yeni elan
      </Link>
    </nav>
  );
}
