"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Star, Loader2 } from "lucide-react";
import { MAX_LISTING_IMAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ERRORS: Record<string, string> = {
  unsupported_type: "Yalnız JPG, PNG və ya WEBP",
  too_large: "Şəkil 5 MB-dan kiçik olmalıdır",
  default: "Şəkil yüklənmədi",
};

export function ImageUploader({ initial = [] }: { initial?: string[] }) {
  const [images, setImages] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSelect(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    const room = MAX_LISTING_IMAGES - images.length;
    const chosen = Array.from(files).slice(0, room);
    for (const file of chosen) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(ERRORS[body.error] ?? ERRORS.default);
        continue;
      }
      const { url } = await res.json();
      setImages((prev) => [...prev, url]);
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const remove = (url: string) =>
    setImages((prev) => prev.filter((u) => u !== url));
  const makePrimary = (url: string) =>
    setImages((prev) => [url, ...prev.filter((u) => u !== url)]);

  return (
    <div>
      {images.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((url, i) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
          >
            <Image src={url} alt="" fill sizes="120px" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-medium text-white">
                Əsas
              </span>
            )}
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition group-hover:opacity-100">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makePrimary(url)}
                  title="Əsas et"
                  className="rounded-full bg-white/90 p-1 text-zinc-700 hover:text-brand-600"
                >
                  <Star className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                title="Sil"
                className="ml-auto rounded-full bg-white/90 p-1 text-zinc-700 hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {images.length < MAX_LISTING_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-zinc-300 text-zinc-400 hover:border-brand-500 hover:text-brand-600",
              busy && "opacity-60",
            )}
          >
            {busy ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <ImagePlus className="size-6" />
            )}
            <span className="text-xs">Şəkil əlavə et</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => onSelect(e.target.files)}
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-zinc-500">
        Ən azı 1, maksimum {MAX_LISTING_IMAGES} şəkil. İlk şəkil əsas şəkildir.
      </p>
    </div>
  );
}
