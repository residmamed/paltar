import { cn } from "@/lib/utils";

export function Alert({
  variant = "error",
  children,
  className,
}: {
  variant?: "error" | "info" | "success";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2 text-sm",
        styles[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
