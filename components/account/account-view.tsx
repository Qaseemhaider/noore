import type { Database } from "@/lib/supabase/database.types";
import { Container } from "@/components/ui/container";
import { ProfileForm } from "./profile-form";
import { AddressList } from "./address-list";
import { LogoutButton } from "./logout-button";

type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

export type OrderItemSummary = {
  product_name: string;
  quantity: number;
  unit_price: number;
  color_name: string;
  size_name: string;
  line_total: number;
};

export type OrderSummary = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  items: OrderItemSummary[];
};

type AccountViewProps = {
  profile: { display_name: string | null; email: string; phone: string | null };
  addresses: AddressRow[];
  orders: OrderSummary[];
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(value);
}

const navLinkClass =
  "type-button inline-flex min-h-11 items-center px-3 text-[var(--color-muted)] hover:text-[var(--color-obsidian)]";

export function AccountView({
  profile,
  addresses,
  orders,
}: AccountViewProps) {
  const firstName =
    profile.display_name?.trim().split(/\s+/)[0] ?? "there";

  return (
    <>
      <header className="border-b border-[var(--color-border)]">
        <Container className="py-[var(--space-12)] md:py-[var(--space-16)]">
          <p className="type-label mb-3 text-[var(--color-crimson)]">Account</p>
          <h1 className="type-page-title">My Account</h1>
          <p className="mt-4 text-[var(--color-muted)]">
            Welcome back, {firstName}. Manage your details, addresses and orders.
          </p>
        </Container>
      </header>

      <nav
        aria-label="Account sections"
        className="border-b border-[var(--color-border)]"
      >
        <Container className="flex flex-wrap items-center gap-x-2 py-2">
          <a href="#profile" className={navLinkClass}>
            Profile
          </a>
          <a href="#addresses" className={navLinkClass}>
            Addresses
          </a>
          <a href="#orders" className={navLinkClass}>
            Orders
          </a>
          <span className="ml-auto">
            <LogoutButton />
          </span>
        </Container>
      </nav>

      <Container className="py-[var(--space-16)] md:py-[var(--space-20)]">
        <div className="grid gap-16 lg:gap-20">
          <section id="profile" aria-labelledby="profile-title" className="scroll-mt-8">
            <h2 id="profile-title" className="type-section-title">
              Profile
            </h2>
            <dl className="mt-6 grid max-w-[42rem] gap-x-8 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="type-meta font-semibold">Email</dt>
                <dd className="mt-1">{profile.email}</dd>
              </div>
              <div>
                <dt className="type-meta font-semibold">Phone</dt>
                <dd className="mt-1">{profile.phone ?? "Not provided"}</dd>
              </div>
            </dl>
            <div className="mt-8">
              <ProfileForm
                displayName={profile.display_name}
                phone={profile.phone}
              />
            </div>
          </section>

          <section
            id="addresses"
            aria-labelledby="addresses-title"
            className="scroll-mt-8 border-t border-[var(--color-border)] pt-16 lg:pt-20"
          >
            <h2 id="addresses-title" className="type-section-title">
              Addresses
            </h2>
            <p className="type-meta mt-3">
              {addresses.length === 0
                ? "No saved addresses yet."
                : `${addresses.length} saved ${addresses.length === 1 ? "address" : "addresses"}.`}
            </p>
            <div className="mt-8">
              <AddressList addresses={addresses} />
            </div>
          </section>

          <section
            id="orders"
            aria-labelledby="orders-title"
            className="scroll-mt-8 border-t border-[var(--color-border)] pt-16 lg:pt-20"
          >
            <h2 id="orders-title" className="type-section-title">
              Order history
            </h2>
            {orders.length === 0 ? (
              <p className="mt-6 max-w-[52ch] text-[var(--color-muted)]">
                You haven&apos;t placed any orders yet. When you do, they&apos;ll
                appear here with their status and details.
              </p>
            ) : (
              <ul className="mt-8 grid gap-6">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">Order {order.order_number}</p>
                        <p className="type-meta mt-1">
                          {formatOrderDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="type-price">{formatMoney(order.total)}</p>
                        <p className="type-meta mt-1">
                          {ORDER_STATUS_LABELS[order.status] ?? order.status} ·{" "}
                          {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-4 border-t border-[var(--color-border)] pt-4">
                      {order.items.map((item, index) => (
                        <li
                          key={`${order.id}-${index}`}
                          className="flex items-baseline justify-between gap-4 py-1 text-sm"
                        >
                          <span className="text-[var(--color-obsidian)]">
                            {item.product_name}
                            <span className="type-meta">
                              {" "}
                              · {item.size_name} · {item.color_name} × {item.quantity}
                            </span>
                          </span>
                          <span className="type-meta whitespace-nowrap">
                            {formatMoney(item.line_total)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Container>
    </>
  );
}
