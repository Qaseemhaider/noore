"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createProductAction,
  setProductPriceAction,
  setProductStatusAction,
  updateProductAction,
  type CatalogActionResult,
} from "@/lib/admin/catalog-actions";
import { inputClass, labelClass, selectClass } from "@/components/auth/form-styles";
import { FormResult } from "./form-result";

export type ProductCategoryOption = {
  id: string;
  name: string;
};

export type ProductFormData = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  description: string | null;
  fabric: string | null;
  care: string | null;
  shippingInfo: string | null;
  price: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isSignature: boolean;
  sortOrder: number;
};

type ProductFormProps =
  | {
      mode: "new";
      categories: ProductCategoryOption[];
      isOwner: boolean;
    }
  | {
      mode: "edit";
      product: ProductFormData;
      categories: ProductCategoryOption[];
      isOwner: boolean;
      canEdit: boolean;
    };

const toggleClass =
  "h-4 w-4 accent-[var(--color-crimson)] focus:outline-none focus:ring-2 focus:ring-[var(--color-crimson)]";

export function ProductForm(props: ProductFormProps) {
  const router = useRouter();
  const { mode, categories, isOwner } = props;

  const [slug, setSlug] = useState(props.mode === "edit" ? props.product.slug : "");
  const [name, setName] = useState(props.mode === "edit" ? props.product.name : "");
  const [categoryId, setCategoryId] = useState(
    props.mode === "edit" ? props.product.categoryId : categories[0]?.id ?? "",
  );
  const [price, setPrice] = useState(props.mode === "edit" ? String(props.product.price) : "");
  const [description, setDescription] = useState(
    props.mode === "edit" ? props.product.description ?? "" : "",
  );
  const [fabric, setFabric] = useState(props.mode === "edit" ? props.product.fabric ?? "" : "");
  const [care, setCare] = useState(props.mode === "edit" ? props.product.care ?? "" : "");
  const [shippingInfo, setShippingInfo] = useState(
    props.mode === "edit" ? props.product.shippingInfo ?? "" : "",
  );
  const [isActive, setIsActive] = useState(props.mode === "edit" ? props.product.isActive : true);
  const [isFeatured, setIsFeatured] = useState(
    props.mode === "edit" ? props.product.isFeatured : false,
  );
  const [isNew, setIsNew] = useState(props.mode === "edit" ? props.product.isNew : false);
  const [isSignature, setIsSignature] = useState(
    props.mode === "edit" ? props.product.isSignature : false,
  );
  const [sortOrder, setSortOrder] = useState(
    props.mode === "edit" ? String(props.product.sortOrder) : "0",
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CatalogActionResult | null>(null);

  const canEdit = props.mode === "edit" ? props.canEdit : isOwner;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setResult(null);

    const base = {
      slug,
      categoryId,
      name,
      description,
      fabric,
      care,
      shippingInfo,
      isActive,
      isFeatured,
      isNew,
      isSignature,
      sortOrder: Number(sortOrder),
    };

    const next =
      mode === "new"
        ? await createProductAction({ ...base, price: Number(price) })
        : await updateProductAction({ ...base, productId: props.product.id });

    setResult(next);
    setBusy(false);

    if (next.status === "ok") {
      if (mode === "new") {
        // Take the owner straight to the canonical edit page so the product's
        // images can be uploaded and managed immediately.
        router.push(next.id ? `/admin/products/${next.id}` : "/admin/products");
      }
      router.refresh();
    }
  }

  async function handleSetPrice() {
    if (busy || mode !== "edit") return;
    setBusy(true);
    setResult(null);
    const next = await setProductPriceAction({
      productId: props.product.id,
      price: Number(price),
    });
    setResult(next);
    setBusy(false);
    if (next.status === "ok") {
      router.refresh();
    }
  }

  async function handleStatusChange(nextActive: boolean) {
    if (busy || mode !== "edit") return;
    setBusy(true);
    setResult(null);
    const next = await setProductStatusAction({
      productId: props.product.id,
      isActive: nextActive,
    });
    setResult(next);
    setBusy(false);
    if (next.status === "ok") {
      router.refresh();
    }
  }

  return (
    <div>
      <FormResult result={result} />

      <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="product-name" className={labelClass}>
              Name
            </label>
            <input
              id="product-name"
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={120}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label htmlFor="product-slug" className={labelClass}>
              Slug
            </label>
            <input
              id="product-slug"
              className={inputClass}
              value={slug}
              onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/\s+/g, "-"))}
              required
              maxLength={120}
              pattern="[a-z0-9-]+"
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="product-category" className={labelClass}>
              Category
            </label>
            <select
              id="product-category"
              className={selectClass}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
              disabled={!canEdit}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-sort" className={labelClass}>
              Sort order
            </label>
            <input
              id="product-sort"
              className={inputClass}
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        {mode === "new" || isOwner ? (
          <div>
            <label htmlFor="product-price" className={labelClass}>
              Price (PKR)
            </label>
            <input
              id="product-price"
              className={inputClass}
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              disabled={!canEdit}
            />
            {mode === "edit" ? (
              <p className="type-meta mt-2">
                Price changes are owner-only and require MFA (AAL2).
              </p>
            ) : null}
          </div>
        ) : null}

        <div>
          <label htmlFor="product-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="product-description"
            className={inputClass}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            disabled={!canEdit}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="product-fabric" className={labelClass}>
              Fabric
            </label>
            <input
              id="product-fabric"
              className={inputClass}
              value={fabric}
              onChange={(event) => setFabric(event.target.value)}
              maxLength={200}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label htmlFor="product-care" className={labelClass}>
              Care
            </label>
            <input
              id="product-care"
              className={inputClass}
              value={care}
              onChange={(event) => setCare(event.target.value)}
              maxLength={200}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label htmlFor="product-shipping" className={labelClass}>
              Shipping info
            </label>
            <input
              id="product-shipping"
              className={inputClass}
              value={shippingInfo}
              onChange={(event) => setShippingInfo(event.target.value)}
              maxLength={200}
              disabled={!canEdit}
            />
          </div>
        </div>

        <fieldset disabled={!canEdit} className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) => setIsFeatured(event.target.checked)}
              className={toggleClass}
            />
            Featured
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(event) => setIsNew(event.target.checked)}
              className={toggleClass}
            />
            New arrival
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={isSignature}
              onChange={(event) => setIsSignature(event.target.checked)}
              className={toggleClass}
            />
            Signature piece
          </label>
          {mode === "new" && isOwner ? (
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className={toggleClass}
              />
              Active (visible on the storefront)
            </label>
          ) : null}
        </fieldset>

        {canEdit ? (
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={busy}
              className="noore-button--auth-primary type-button min-w-44 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Saving…" : mode === "new" ? "Create product" : "Save changes"}
            </button>
            {mode === "new" ? (
              <span className="type-meta">
                Creating a product requires owner MFA (AAL2).
              </span>
            ) : null}
          </div>
        ) : (
          <p className="type-meta text-[var(--color-crimson)]">
            You have view-only access to this product.
          </p>
        )}
      </form>

      {mode === "edit" ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {isOwner ? (
            <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <h2 className="type-section-title">Set price</h2>
              <p className="type-meta mt-2">
                Requires owner MFA (AAL2). The storefront uses this canonical PKR
                price.
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div className="min-w-40 flex-1">
                  <label htmlFor="edit-price" className={labelClass}>
                    Price (PKR)
                  </label>
                  <input
                    id="edit-price"
                    className={inputClass}
                    type="number"
                    min={0}
                    step={1}
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSetPrice}
                  disabled={busy}
                  className="noore-button--auth-primary type-button min-w-40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Updating…" : "Update price"}
                </button>
              </div>
            </div>
          ) : null}

          {canEdit ? (
            <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <h2 className="type-section-title">
                {props.product.isActive ? "Deactivate product" : "Reactivate product"}
              </h2>
              <p className="type-meta mt-2">
                {props.product.isActive
                  ? "Removes the product from the storefront. Owner or store manager with MFA (AAL2). You can reactivate it later from this page."
                  : "Returns the product to the storefront. Owner or store manager with MFA (AAL2)."}
              </p>
              <button
                type="button"
                onClick={() => handleStatusChange(!props.product.isActive)}
                disabled={busy}
                className="type-button mt-4 px-3 py-2 text-[var(--color-crimson)] underline underline-offset-3 hover:text-[var(--color-crimson-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? "Updating…"
                  : props.product.isActive
                    ? "Deactivate product"
                    : "Reactivate product"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
