import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  AccountView,
  type OrderItemSummary,
  type OrderSummary,
} from "@/components/account/account-view";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your NOORE profile, saved addresses and order history.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountRoute() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  // Seed the display name once from signup metadata if the bootstrap trigger
  // created the profile without it (e.g. email-confirmation flow).
  let displayName = profile?.display_name ?? null;
  if (!profileError && profile && !profile.display_name) {
    const metadataName = user.user_metadata?.display_name;
    if (typeof metadataName === "string" && metadataName.trim() !== "") {
      displayName = metadataName.trim();
      await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);
    }
  }

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, created_at, status, payment_status, total")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  let orderSummaries: OrderSummary[] = [];
  if (orders && orders.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select(
        "order_id, product_name, quantity, unit_price, color_name, size_name, line_total",
      )
      .in(
        "order_id",
        orders.map((order) => order.id),
      );

    orderSummaries = orders.map((order) => ({
      ...order,
      items: (items ?? []).filter(
        (item): item is OrderItemSummary & { order_id: string } =>
          item.order_id === order.id,
      ),
    }));
  }

  return (
    <AccountView
      profile={{
        display_name: displayName,
        email: profile?.email ?? user.email ?? "",
        phone: profile?.phone ?? null,
      }}
      addresses={addresses ?? []}
      orders={orderSummaries}
    />
  );
}
