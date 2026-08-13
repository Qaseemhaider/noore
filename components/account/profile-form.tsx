"use client";

import { useActionState } from "react";
import {
  updateProfileAction,
  type AccountActionState,
} from "@/lib/account-actions";
import { errorClass, inputClass, labelClass } from "@/components/auth/form-styles";
import { SubmitButton } from "./submit-button";

type ProfileFormProps = {
  displayName: string | null;
  phone: string | null;
};

export function ProfileForm({ displayName, phone }: ProfileFormProps) {
  const [state, formAction] = useActionState<AccountActionState, FormData>(
    updateProfileAction,
    { status: "idle", message: "" },
  );

  return (
    <div>
      <form
        action={formAction}
        className="grid max-w-[42rem] gap-5 sm:grid-cols-2"
        noValidate
      >
        <div>
          <label htmlFor="profile-name" className={labelClass}>
            Full name
          </label>
          <input
            id="profile-name"
            name="fullName"
            type="text"
            autoComplete="name"
            defaultValue={displayName ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="profile-phone" className={labelClass}>
            Phone <span className="font-normal">(optional)</span>
          </label>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={phone ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-4 sm:col-span-2">
          <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
        </div>
      </form>
      <div aria-live="polite">
        {state.status === "success" ? (
          <p className={`${errorClass} mt-4 text-[var(--color-muted)]`}>{state.message}</p>
        ) : state.status === "error" ? (
          <p className={`${errorClass} mt-4`}>{state.message}</p>
        ) : null}
      </div>
    </div>
  );
}
