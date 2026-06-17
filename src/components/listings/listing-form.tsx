"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Input, Textarea, Label, selectClasses } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { ImageUploader } from "@/components/listings/image-uploader";
import { DEPARTMENTS, CATEGORIES, CONDITIONS } from "@/lib/constants";
import type { ListingFormState } from "@/app/listings/actions";

export interface ListingDefaults {
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
}

export function ListingForm({
  action,
  defaults = {},
  submitLabel,
}: {
  action: (prev: ListingFormState, fd: FormData) => Promise<ListingFormState>;
  defaults?: ListingDefaults;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<ListingFormState, FormData>(
    action,
    {},
  );
  const td = useTranslations("department");
  const tcat = useTranslations("category");
  const tcond = useTranslations("condition");

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert>{state.error}</Alert>}

      <div>
        <Label htmlFor="title">Başlıq</Label>
        <Input id="title" name="title" defaultValue={defaults.title} required maxLength={100} />
      </div>

      <div>
        <Label htmlFor="description">Təsvir</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaults.description}
          required
          maxLength={2000}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="department">Bölmə</Label>
          <select id="department" name="department" defaultValue={defaults.department ?? ""} required className={selectClasses}>
            <option value="" disabled>Seçin</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{td(d)}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="category">Kateqoriya</Label>
          <select id="category" name="category" defaultValue={defaults.category ?? ""} required className={selectClasses}>
            <option value="" disabled>Seçin</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{tcat(c)}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="condition">Vəziyyət</Label>
          <select id="condition" name="condition" defaultValue={defaults.condition ?? ""} required className={selectClasses}>
            <option value="" disabled>Seçin</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{tcond(c)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="brand">Marka (istəyə bağlı)</Label>
          <Input id="brand" name="brand" defaultValue={defaults.brand} maxLength={50} />
        </div>
        <div>
          <Label htmlFor="size">Ölçü</Label>
          <Input id="size" name="size" defaultValue={defaults.size} required maxLength={20} placeholder="S, M, 42 ..." />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Qiymət (₼)</Label>
          <Input id="price" name="price" inputMode="decimal" defaultValue={defaults.price} required placeholder="45" />
          <label className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
            <input type="checkbox" name="negotiable" defaultChecked={defaults.negotiable} className="size-4 rounded" />
            Razılaşma yolu ilə
          </label>
        </div>
        <div>
          <Label htmlFor="city">Şəhər</Label>
          <Input id="city" name="city" defaultValue={defaults.city} required maxLength={50} placeholder="Bakı" />
        </div>
      </div>

      <div>
        <Label htmlFor="contactPhone">Əlaqə telefonu</Label>
        <Input
          id="contactPhone"
          name="contactPhone"
          type="tel"
          inputMode="tel"
          defaultValue={defaults.contactPhone}
          required
          placeholder="+994 50 123 45 67"
        />
      </div>

      <div>
        <Label>Şəkillər</Label>
        <ImageUploader initial={defaults.images} />
      </div>

      <SubmitButton size="lg">{submitLabel}</SubmitButton>
    </form>
  );
}
