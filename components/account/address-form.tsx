"use client";

import { useEffect, useActionState } from "react";
import {
  addAddressAction,
  updateAddressAction,
  type AccountActionState,
} from "@/lib/account-actions";
import { errorClass, inputClass, labelClass, selectClass } from "@/components/auth/form-styles";
import { SubmitButton } from "./submit-button";

const COUNTRIES = [
  { code: "PK", label: "Pakistan" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "GB", label: "United Kingdom" },
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
];

export type AddressFormValue = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
};

type AddressFormProps = {
  editing?: boolean;
  initial?: AddressFormValue;
  addressId?: string;
  onCancel?: () => void;
  submitLabel?: string;
};

export function AddressForm({
  editing = false,
  initial,
  addressId,
  onCancel,
  submitLabel = "Add address",
}: AddressFormProps) {
  const action = editing ? updateAddressAction : addAddressAction;
  const [state, formAction] = useActionState<AccountActionState, FormData>(
    action,
    { status: "idle", message: "" },
  );

  useEffect(() => {
    if (state.status !== "success") return;
    const timer = setTimeout(() => onCancel?.(), 1200);
    return () => clearTimeout(timer);
  }, [state.status, onCancel]);

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <form
        action={formAction}
        className="grid gap-5 sm:grid-cols-2"
        noValidate
      >
        {editing && addressId ? (
          <input type="hidden" name="addressId" value={addressId} />
        ) : null}

        <div>
          <label htmlFor={`${editing ? "edit" : "add"}-full-name`} className={labelClass}>
            Full name
          </label>
          <input
            id={`${editing ? "edit" : "add"}-full-name`}
            name="fullName"
            type="text"
            autoComplete="name"
            defaultValue={initial?.fullName ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${editing ? "edit" : "add"}-phone`} className={labelClass}>
            Phone
          </label>
          <input
            id={`${editing ? "edit" : "add"}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={initial?.phone ?? ""}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${editing ? "edit" : "add"}-address`} className={labelClass}>
            Street address
          </label>
          <input
            id={`${editing ? "edit" : "add"}-address`}
            name="address"
            type="text"
            autoComplete="street-address"
            defaultValue={initial?.address ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${editing ? "edit" : "add"}-city`} className={labelClass}>
            City
          </label>
          <input
            id={`${editing ? "edit" : "add"}-city`}
            name="city"
            type="text"
            autoComplete="address-level2"
            defaultValue={initial?.city ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${editing ? "edit" : "add"}-state`} className={labelClass}>
            State / province <span className="font-normal">(optional)</span>
          </label>
          <input
            id={`${editing ? "edit" : "add"}-state`}
            name="state"
            type="text"
            autoComplete="address-level1"
            defaultValue={initial?.state ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${editing ? "edit" : "add"}-postal`} className={labelClass}>
            Postal code <span className="font-normal">(optional)</span>
          </label>
          <input
            id={`${editing ? "edit" : "add"}-postal`}
            name="postalCode"
            type="text"
            autoComplete="postal-code"
            defaultValue={initial?.postalCode ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${editing ? "edit" : "add"}-country`} className={labelClass}>
            Country
          </label>
          <select
            id={`${editing ? "edit" : "add"}-country`}
            name="country"
            autoComplete="country"
            defaultValue={initial?.country ?? "PK"}
            className={selectClass}
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="type-button min-h-11 px-4 text-[var(--color-muted)] underline underline-offset-3 hover:text-[var(--color-obsidian)]"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <div aria-live="polite">
        {state.status === "success" ? (
          <p className="type-meta mt-4 text-[var(--color-muted)]">{state.message}</p>
        ) : state.status === "error" ? (
          <p className={`${errorClass} mt-4`}>{state.message}</p>
        ) : null}
      </div>
    </div>
  );
}
