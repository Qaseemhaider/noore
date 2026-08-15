"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useActionState } from "react";
import {
  moveProductImageAction,
  removeProductImageAction,
  setProductImagePrimaryAction,
  updateProductImageAltAction,
  uploadProductImageAction,
  type CatalogActionResult,
} from "@/lib/admin/catalog-actions";
import { isPlaceholderImage, resolveImageSrc } from "@/lib/catalog/image-url";
import { inputClass, labelClass } from "@/components/auth/form-styles";
import { FormResult } from "./form-result";

export type AdminProductImageRow = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
};

type ProductImagesManagerProps = {
  productId: string;
  images: AdminProductImageRow[];
  canManage: boolean;
};

const tinyButton =
  "type-button px-2.5 py-1.5 text-sm text-[var(--color-obsidian)] underline underline-offset-3 hover:text-[var(--color-crimson)] disabled:cursor-not-allowed disabled:opacity-40";

export function ProductImagesManager({
  productId,
  images,
  canManage,
}: ProductImagesManagerProps) {
  const router = useRouter();
  const [uploadState, uploadFormAction, isUploading] = useActionState(
    uploadProductImageAction,
    null,
  );
  const [result, setResult] = useState<CatalogActionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState("");

  useEffect(() => {
    if (uploadState?.status === "ok") {
      router.refresh();
    }
  }, [uploadState, router]);

  async function run(next: Promise<CatalogActionResult>) {
    if (busy) return;
    setBusy(true);
    setResult(null);
    const outcome = await next;
    setResult(outcome);
    setBusy(false);
    if (outcome.status === "ok") {
      setEditingAltId(null);
      router.refresh();
    }
  }

  function beginAltEdit(image: AdminProductImageRow) {
    setEditingAltId(image.id);
    setAltDraft(image.alt_text ?? "");
    setResult(null);
  }

  async function handleSaveAlt(image: AdminProductImageRow) {
    await run(
      updateProductImageAltAction({ imageId: image.id, altText: altDraft }),
    );
  }

  const sorted = [...images].sort((a, b) => a.position - b.position);

  return (
    <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="type-section-title">Product images</h2>
      <p className="type-meta mt-2">
        JPEG, PNG or WebP up to 5 MB. The first image is the storefront primary.
        Placeholder images stay local until replaced by an upload.
      </p>

      {canManage ? (
        <form action={uploadFormAction} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="productId" value={productId} />
          <div className="min-w-64 flex-1">
            <label htmlFor="image-upload" className={labelClass}>
              Image file
            </label>
            <input
              id="image-upload"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="block w-full text-sm text-[var(--color-obsidian)] file:mr-3 file:border-0 file:bg-[var(--color-obsidian)] file:px-4 file:py-2 file:text-sm file:text-[var(--color-warm-ivory)]"
            />
          </div>
          <button
            type="submit"
            disabled={isUploading}
            className="noore-button--auth-primary type-button min-w-36 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "Uploading…" : "Upload image"}
          </button>
        </form>
      ) : (
        <p className="type-meta mt-2 text-[var(--color-muted)]">
          View only — uploading and managing images requires catalog edit access.
        </p>
      )}

      <FormResult result={uploadState ?? result} />

      {sorted.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--color-muted)]">
          No images yet. Upload one to appear on the storefront.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((image, index) => (
            <li
              key={image.id}
              className="border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageSrc(image.storage_path)}
                alt={image.alt_text ?? "Product image"}
                className="aspect-square w-full object-cover"
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="type-meta">
                  {image.is_primary ? (
                    <span className="font-semibold text-[var(--color-crimson)]">Primary</span>
                  ) : (
                    "—"
                  )}
                </p>
                <p className="type-meta">{isPlaceholderImage(image.storage_path) ? "Placeholder" : "Uploaded"}</p>
              </div>

              {editingAltId === image.id ? (
                <div className="mt-2 grid gap-2">
                  <label htmlFor={`alt-${image.id}`} className={labelClass}>
                    Alt text
                  </label>
                  <input
                    id={`alt-${image.id}`}
                    className={inputClass}
                    value={altDraft}
                    onChange={(event) => setAltDraft(event.target.value)}
                    maxLength={300}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleSaveAlt(image)}
                      className="noore-button--auth-primary type-button min-w-24 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setEditingAltId(null)}
                      className={tinyButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-[var(--color-muted)]">
                    {image.alt_text ? (
                      image.alt_text
                    ) : (
                      <span className="italic">No alt text</span>
                    )}
                  </p>
                </div>
              )}

              {canManage ? (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {!image.is_primary ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(setProductImagePrimaryAction({ imageId: image.id }))
                      }
                      className={tinyButton}
                    >
                      Set primary
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label="Move image up"
                    disabled={busy || index === 0}
                    onClick={() => run(moveProductImageAction({ imageId: image.id, direction: "up" }))}
                    className={tinyButton}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    aria-label="Move image down"
                    disabled={busy || index === sorted.length - 1}
                    onClick={() =>
                      run(moveProductImageAction({ imageId: image.id, direction: "down" }))
                    }
                    className={tinyButton}
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => beginAltEdit(image)}
                    className={tinyButton}
                  >
                    Edit alt
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Remove this image? The file will be deleted from storage.",
                        )
                      ) {
                        run(removeProductImageAction({ imageId: image.id }));
                      }
                    }}
                    className="type-button px-2.5 py-1.5 text-sm text-[var(--color-crimson)] underline underline-offset-3 hover:text-[var(--color-crimson-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
