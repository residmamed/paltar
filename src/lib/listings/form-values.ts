/** Submitted listing form values preserved across validation errors. */
export type ListingFormValues = {
  title?: string;
  description?: string;
  department?: string;
  category?: string;
  condition?: string;
  brand?: string;
  size?: string;
  price?: string;
  negotiable?: boolean;
  city?: string;
  contactPhone?: string;
  images?: string[];
};

export function extractListingFormValues(formData: FormData): ListingFormValues {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    department: String(formData.get("department") ?? ""),
    category: String(formData.get("category") ?? ""),
    condition: String(formData.get("condition") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    size: String(formData.get("size") ?? ""),
    price: String(formData.get("price") ?? ""),
    negotiable: formData.get("negotiable") != null,
    city: String(formData.get("city") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? ""),
    images: formData.getAll("images").map(String).filter(Boolean),
  };
}
