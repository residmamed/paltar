"use client";

import { cn } from "@/lib/utils";

/** A form-submit button that confirms before triggering its form's server action. */
export function ConfirmSubmitButton({
  action,
  confirmText,
  children,
  className,
}: {
  action: () => Promise<void>;
  confirmText: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className={cn(
          "rounded-full px-3 py-1.5 text-sm font-medium transition",
          className,
        )}
      >
        {children}
      </button>
    </form>
  );
}
