"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { addressSchema, profileSchema } from "@/lib/auth/validation";

export type AccountActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function firstMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Please check your details and try again.";
}

/**
 * Every action re-verifies identity with auth.getUser() and scopes all writes
 * to that user id. Form data is validated with Zod; the user id is never read
 * from the form. RLS is the final boundary on every statement.
 */
async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }
  return { supabase, user };
}

function parseAddress(formData: FormData) {
  return addressSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") ?? "PK",
  });
}

export async function updateProfileAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const { supabase, user } = await requireSession();

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { status: "error", message: firstMessage(parsed.error) };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.fullName,
      phone: parsed.data.phone,
    })
    .eq("id", user.id);

  if (error) {
    return {
      status: "error",
      message: "We were unable to update your profile. Please try again.",
    };
  }

  revalidatePath("/account");
  return { status: "success", message: "Your profile has been updated." };
}

export async function addAddressAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const { supabase, user } = await requireSession();

  const parsed = parseAddress(formData);
  if (!parsed.success) {
    return { status: "error", message: firstMessage(parsed.error) };
  }

  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    address: parsed.data.address,
    city: parsed.data.city,
    state: parsed.data.state,
    postal_code: parsed.data.postalCode,
    country: parsed.data.country,
    is_default: (count ?? 0) === 0,
  });

  if (error) {
    return {
      status: "error",
      message: "We were unable to save the address. Please try again.",
    };
  }

  revalidatePath("/account");
  return { status: "success", message: "Address added." };
}

export async function updateAddressAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const { supabase, user } = await requireSession();

  const addressId = formData.get("addressId");
  if (typeof addressId !== "string" || addressId.length === 0) {
    return {
      status: "error",
      message: "Something went wrong. Please refresh and try again.",
    };
  }

  const parsed = parseAddress(formData);
  if (!parsed.success) {
    return { status: "error", message: firstMessage(parsed.error) };
  }

  const { error } = await supabase
    .from("addresses")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      postal_code: parsed.data.postalCode,
      country: parsed.data.country,
    })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    return {
      status: "error",
      message: "We were unable to update the address. Please try again.",
    };
  }

  revalidatePath("/account");
  return { status: "success", message: "Address updated." };
}

export async function deleteAddressAction(
  formData: FormData,
): Promise<AccountActionState> {
  const { supabase, user } = await requireSession();

  const addressId = formData.get("addressId");
  if (typeof addressId !== "string" || addressId.length === 0) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const { data: target, error: fetchError } = await supabase
    .from("addresses")
    .select("is_default")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !target) {
    return { status: "error", message: "Address not found." };
  }

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    return {
      status: "error",
      message: "We were unable to remove the address. Please try again.",
    };
  }

  // If the removed address was the default and others remain, promote the
  // oldest remaining one so the account always has a usable default.
  if (target.is_default) {
    const { data: remaining } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1);
    if (remaining && remaining.length > 0) {
      await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", remaining[0].id)
        .eq("user_id", user.id);
    }
  }

  revalidatePath("/account");
  return { status: "success", message: "Address removed." };
}

export async function setDefaultAddressAction(
  formData: FormData,
): Promise<AccountActionState> {
  const { supabase, user } = await requireSession();

  const addressId = formData.get("addressId");
  if (typeof addressId !== "string" || addressId.length === 0) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const { error: clearError } = await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id)
    .neq("id", addressId);

  if (clearError) {
    return {
      status: "error",
      message: "We were unable to update the address. Please try again.",
    };
  }

  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    return {
      status: "error",
      message: "We were unable to update the address. Please try again.",
    };
  }

  revalidatePath("/account");
  return { status: "success", message: "Default address updated." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?status=signed_out");
}
