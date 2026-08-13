"use client";

import { useState } from "react";
import type { Database } from "@/lib/supabase/database.types";
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/account-actions";
import { AddressForm, type AddressFormValue } from "./address-form";

type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

const linkClass =
  "type-button min-h-11 px-3 text-[var(--color-crimson)] underline underline-offset-3 hover:text-[var(--color-crimson-hover)]";

function toFormValue(address: AddressRow): AddressFormValue {
  return {
    fullName: address.full_name,
    phone: address.phone,
    address: address.address,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
  };
}

export function AddressList({ addresses }: { addresses: AddressRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div>
      {addresses.length === 0 && !adding ? (
        <p className="max-w-[52ch] text-[var(--color-muted)]">
          You haven&apos;t saved any addresses yet. Add one to make checkout
          faster next time.
        </p>
      ) : null}

      {addresses.length > 0 ? (
        <ul className="grid gap-5 lg:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              {editingId === address.id ? (
                <AddressForm
                  editing
                  addressId={address.id}
                  initial={toFormValue(address)}
                  submitLabel="Save address"
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {address.full_name}
                    {address.is_default ? (
                      <span className="type-label bg-[var(--color-surface-muted)] px-2 py-1 text-[var(--color-muted)]">
                        Default
                      </span>
                    ) : null}
                  </p>
                  <p className="type-meta mt-2 whitespace-pre-line">
                    {address.address}
                    {"\n"}
                    {address.city}
                    {address.state ? `, ${address.state}` : ""}
                    {address.postal_code ? ` ${address.postal_code}` : ""}
                    {"\n"}
                    {address.country}
                  </p>
                  <p className="type-meta mt-1">{address.phone}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(address.id);
                        setConfirmingId(null);
                      }}
                      className={linkClass}
                    >
                      Edit
                    </button>
                    {!address.is_default ? (
                      <form action={async (formData) => { await setDefaultAddressAction(formData); }}>
                        <input type="hidden" name="addressId" value={address.id} />
                        <button type="submit" className={linkClass}>
                          Make default
                        </button>
                      </form>
                    ) : null}
                    <form action={async (formData) => { await deleteAddressAction(formData); }}>
                      <input type="hidden" name="addressId" value={address.id} />
                      {confirmingId === address.id ? (
                        <button
                          type="submit"
                          className="type-button min-h-11 px-3 font-semibold text-[var(--color-crimson)]"
                        >
                          Confirm remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingId(address.id)}
                          className={linkClass}
                        >
                          Remove
                        </button>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {adding ? (
        <div className="mt-6 max-w-[42rem]">
          <AddressForm onCancel={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="type-button mt-6 inline-flex min-h-11 items-center border border-[var(--color-obsidian)] px-6 transition-colors duration-200 hover:bg-[var(--color-surface-muted)]"
        >
          Add an address
        </button>
      )}
    </div>
  );
}
