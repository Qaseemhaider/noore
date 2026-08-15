"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createCategoryAction,
  createColorAction,
  createSizeAction,
  moveReferenceAction,
  updateCategoryAction,
  updateColorAction,
  updateSizeAction,
  type CatalogActionResult,
} from "@/lib/admin/catalog-actions";
import type { ReferenceEntity } from "@/lib/admin/validation";
import { inputClass, labelClass } from "@/components/auth/form-styles";
import { FormResult } from "./form-result";

export type ReferenceField = {
  key: string;
  label: string;
  type?: "text" | "number" | "hex";
  required?: boolean;
  placeholder?: string;
};

export type ReferenceRow = {
  id: string;
  values: Record<string, string>;
};

type ReferenceManagerProps = {
  canManage: boolean;
  createLabel: string;
  entity: ReferenceEntity;
  fields: ReferenceField[];
  rows: ReferenceRow[];
};

type Payload = Record<string, string | number | undefined>;

function emptyValues(fields: ReferenceField[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

/** Builds the RPC payload shape for the entity from plain form values. */
function buildPayload(entity: ReferenceEntity, values: Record<string, string>): Payload {
  const sortOrder = Number(values.sortOrder ?? 0);
  switch (entity) {
    case "category":
      return { slug: values.slug ?? "", name: values.name ?? "", sortOrder };
    case "color":
      return {
        name: values.name ?? "",
        ...(values.hex?.trim() ? { hex: values.hex } : {}),
        sortOrder,
      };
    case "size":
      return { name: values.name ?? "", sortOrder };
  }
}

const CREATE_ACTIONS: Record<ReferenceEntity, (input: unknown) => Promise<CatalogActionResult>> = {
  category: createCategoryAction,
  color: createColorAction,
  size: createSizeAction,
};

const UPDATE_ACTIONS: Record<ReferenceEntity, (input: unknown) => Promise<CatalogActionResult>> = {
  category: updateCategoryAction,
  color: updateColorAction,
  size: updateSizeAction,
};

const hexInput = `${inputClass} font-mono uppercase`;

export function ReferenceManager({
  canManage,
  createLabel,
  entity,
  fields,
  rows,
}: ReferenceManagerProps) {
  const router = useRouter();
  const [createValues, setCreateValues] = useState(() => emptyValues(fields));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CatalogActionResult | null>(null);

  function updateValue(
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    key: string,
    value: string,
  ) {
    setter((previous) => ({ ...previous, [key]: value }));
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setResult(null);
    const next = await CREATE_ACTIONS[entity](buildPayload(entity, createValues));
    setResult(next);
    setBusy(false);
    if (next.status === "ok") {
      setCreateValues(emptyValues(fields));
      router.refresh();
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !editingId) return;
    setBusy(true);
    setResult(null);
    const next = await UPDATE_ACTIONS[entity]({
      ...buildPayload(entity, editValues),
      id: editingId,
    });
    setResult(next);
    setBusy(false);
    if (next.status === "ok") {
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleMove(id: string, direction: "up" | "down") {
    if (busy) return;
    setBusy(true);
    setResult(null);
    const next = await moveReferenceAction({ entity, id, direction });
    setResult(next);
    setBusy(false);
    if (next.status === "ok") {
      router.refresh();
    }
  }

  function beginEdit(row: ReferenceRow) {
    setEditingId(row.id);
    setEditValues({ ...row.values });
    setResult(null);
  }

  const fieldClass = (field: ReferenceField) => (field.type === "hex" ? hexInput : inputClass);

  return (
    <div>
      <FormResult result={result} />

      {canManage ? (
        <form
          onSubmit={handleCreate}
          className="mt-6 grid gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {fields.map((field) => (
            <div key={field.key}>
              <label htmlFor={`create-${field.key}`} className={labelClass}>
                {field.label}
              </label>
              <input
                id={`create-${field.key}`}
                className={fieldClass(field)}
                type={field.type === "number" ? "number" : "text"}
                value={createValues[field.key]}
                onChange={(event) =>
                  updateValue(setCreateValues, field.key, event.target.value)
                }
                placeholder={field.placeholder}
                required={field.required}
              />
            </div>
          ))}
          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={busy}
              className="noore-button--auth-primary type-button min-w-44 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Saving…" : createLabel}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-[var(--color-muted)]">You have view-only access.</p>
      )}

      <ul className="mt-8 grid gap-4">
        {rows.map((row, index) => {
          const isEditing = editingId === row.id;
          return (
            <li
              key={row.id}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              {!isEditing ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    {fields.map((field) => (
                      <div key={field.key}>
                        <p className="type-meta font-semibold">{field.label}</p>
                        <p className="mt-0.5 text-sm">
                          {field.type === "hex" ? (
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block h-3.5 w-3.5 border border-[var(--color-border)]"
                                style={{
                                  backgroundColor: row.values[field.key] || "transparent",
                                }}
                              />
                              <span className="font-mono uppercase">
                                {row.values[field.key] || "—"}
                              </span>
                            </span>
                          ) : (
                            row.values[field.key] || "—"
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {canManage ? (
                      <>
                        <span className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Move up"
                            onClick={() => handleMove(row.id, "up")}
                            disabled={busy || index === 0}
                            className="px-2 py-1 text-sm text-[var(--color-obsidian)] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            aria-label="Move down"
                            onClick={() => handleMove(row.id, "down")}
                            disabled={busy || index === rows.length - 1}
                            className="px-2 py-1 text-sm text-[var(--color-obsidian)] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            ↓
                          </button>
                        </span>
                        <button
                          type="button"
                          onClick={() => beginEdit(row)}
                          className="type-button px-3 py-2 text-[var(--color-crimson)] underline underline-offset-3 hover:text-[var(--color-crimson-hover)]"
                        >
                          Edit
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleUpdate}
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label htmlFor={`edit-${row.id}-${field.key}`} className={labelClass}>
                        {field.label}
                      </label>
                      <input
                        id={`edit-${row.id}-${field.key}`}
                        className={fieldClass(field)}
                        type={field.type === "number" ? "number" : "text"}
                        value={editValues[field.key] ?? ""}
                        onChange={(event) =>
                          updateValue(setEditValues, field.key, event.target.value)
                        }
                        required={field.required}
                      />
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
                    <button
                      type="submit"
                      disabled={busy}
                      className="noore-button--auth-primary type-button min-w-32 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      disabled={busy}
                      className="type-button px-3 py-2 text-[var(--color-obsidian)] underline underline-offset-3 hover:text-[var(--color-crimson)]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
