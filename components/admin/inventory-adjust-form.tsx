"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  adjustInventoryAction,
  type CatalogActionResult,
} from "@/lib/admin/catalog-actions";
import { inputClass, labelClass } from "@/components/auth/form-styles";
import { FormResult } from "./form-result";

type InventoryAdjustFormProps = {
  variantId: string;
  sku: string;
  currentStock: number;
};

export function InventoryAdjustForm({ variantId, sku, currentStock }: InventoryAdjustFormProps) {
  const router = useRouter();
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CatalogActionResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setResult(null);

    const next = await adjustInventoryAction({
      variantId,
      delta: Number(delta),
      reason,
    });
    setResult(next);
    setBusy(false);

    if (next.status === "ok") {
      setDelta("");
      setReason("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[8rem_1fr_auto]">
        <div>
          <label htmlFor={`delta-${variantId}`} className={labelClass}>
            Delta
          </label>
          <input
            id={`delta-${variantId}`}
            className={inputClass}
            type="number"
            step={1}
            value={delta}
            onChange={(event) => setDelta(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor={`reason-${variantId}`} className={labelClass}>
            Reason
          </label>
          <input
            id={`reason-${variantId}`}
            className={inputClass}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={200}
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy || !delta || !reason.trim()}
            className="noore-button--auth-primary type-button min-w-32 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Adjusting…" : "Adjust"}
          </button>
        </div>
      </div>
      <p className="type-meta">
        {sku} · current stock: {currentStock} · use +N to add stock, −N to remove.
        Requires MFA (AAL2).
      </p>
      <FormResult result={result} />
    </form>
  );
}
