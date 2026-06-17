import { cn } from "@/lib/utils";
import { ListingState } from "@/generated/prisma/enums";

const config: Record<ListingState, { label: string; className: string }> = {
  PENDING: { label: "Yoxlanılır", className: "bg-amber-100 text-amber-800" },
  ACTIVE: { label: "Aktiv", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Deaktiv", className: "bg-zinc-200 text-zinc-700" },
  SOLD: { label: "Satıldı", className: "bg-blue-100 text-blue-800" },
  REJECTED: { label: "Rədd edildi", className: "bg-red-100 text-red-800" },
};

export function ListingStateBadge({ state }: { state: ListingState }) {
  const c = config[state];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        c.className,
      )}
    >
      {c.label}
    </span>
  );
}
