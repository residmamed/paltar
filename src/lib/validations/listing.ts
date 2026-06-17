import { z } from "zod";
import { Category, Condition, Department } from "@/generated/prisma/enums";
import { MAX_LISTING_IMAGES, MIN_LISTING_IMAGES } from "@/lib/constants";

export const listingSchema = z.object({
  title: z.string().trim().min(3, "Başlıq ən azı 3 simvol olmalıdır").max(100),
  description: z
    .string()
    .trim()
    .min(10, "Təsvir ən azı 10 simvol olmalıdır")
    .max(2000),
  department: z.enum(Department),
  category: z.enum(Category),
  condition: z.enum(Condition),
  brand: z.string().trim().max(50).optional(),
  size: z.string().trim().min(1, "Ölçü daxil edin").max(20),
  priceMinor: z
    .number()
    .int()
    .min(0, "Qiymət düzgün deyil")
    .max(10_000_000, "Qiymət çox böyükdür"),
  negotiable: z.boolean(),
  city: z.string().trim().min(2, "Şəhər daxil edin").max(50),
  contactPhone: z
    .string()
    .regex(/^\+994\d{9}$/, "Düzgün telefon nömrəsi daxil edin"),
  images: z
    .array(z.string().min(1))
    .min(MIN_LISTING_IMAGES, "Ən azı bir şəkil əlavə edin")
    .max(MAX_LISTING_IMAGES, `Maksimum ${MAX_LISTING_IMAGES} şəkil`),
});

export type ListingInput = z.infer<typeof listingSchema>;

/** Parse a free-text AZN price ("45", "45.50", "45,5") into minor units (qəpik). */
export function parsePriceToMinor(raw: string): number | null {
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(parseFloat(normalized) * 100);
}
