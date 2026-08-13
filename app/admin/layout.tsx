import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireStaff } from "@/lib/admin/authorization";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireStaff();
  return <AdminShell staff={staff}>{children}</AdminShell>;
}
