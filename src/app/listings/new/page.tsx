import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-helpers";
import { ListingForm } from "@/components/listings/listing-form";
import { createListing } from "@/app/listings/actions";

export const metadata: Metadata = { title: "Yeni elan" };

export default async function NewListingPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Yeni elan</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Elanınız dərc olunmazdan əvvəl moderator tərəfindən yoxlanılacaq.
      </p>
      <ListingForm
        action={createListing}
        defaults={{ contactPhone: user.phone ?? "" }}
        submitLabel="Elanı göndər"
      />
    </div>
  );
}
