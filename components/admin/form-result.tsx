import type { CatalogActionResult } from "@/lib/admin/catalog-actions";

/** Accessible, tone-aware message shown after a catalog server action. */
export function FormResult({ result }: { result: CatalogActionResult | null }) {
  if (!result) return null;
  const ok = result.status === "ok";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-4 border px-4 py-3 text-sm ${
        ok
          ? "border-[var(--color-champagne)] bg-[var(--color-surface-muted)] text-[var(--color-obsidian)]"
          : "border-[var(--color-crimson)] bg-[var(--color-surface-muted)] text-[var(--color-crimson)]"
      }`}
    >
      {result.message}
      {result.status === "mfa_required" ? (
        <span className="mt-1 block">
          Complete the MFA challenge on the{" "}
          <a href="/admin/security?need_mfa=1" className="underline underline-offset-3">
            Security page
          </a>
          , then try again.
        </span>
      ) : null}
    </div>
  );
}
