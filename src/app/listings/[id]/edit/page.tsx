import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { ListingForm } from "@/components/listings/listing-form";
import { updateListing } from "@/app/listings/actions";

export const metadata: Metadata = { title: "Elanı redaktə et" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!listing) notFound();
  if (listing.ownerId !== user.id) redirect("/account/listings");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Elanı redaktə et</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Yalnız qiymət dəyişikliyi dərhal tətbiq olunur. Digər dəyişikliklər yenidən
        yoxlamadan keçəcək.
      </p>
      <ListingForm
        action={updateListing.bind(null, id)}
        submitLabel="Yadda saxla"
        defaults={{
          title: listing.title,
          description: listing.description,
          department: listing.department,
          category: listing.category,
          condition: listing.condition,
          brand: listing.brand ?? "",
          size: listing.size,
          price: (listing.priceMinor / 100).toString(),
          negotiable: listing.negotiable,
          city: listing.city,
          contactPhone: listing.contactPhone,
          images: listing.images.map((i) => i.url),
        }}
      />
    </div>
  );
}
