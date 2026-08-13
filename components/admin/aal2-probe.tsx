"use client";

import { useState } from "react";
import { runOwnerSecurityProbeAction, type SecurityProbeResult } from "@/lib/admin/actions";

/**
 * Safe AAL2 enforcement demonstration. The server action independently
 * re-verifies owner + AAL2 from the validated session and records an
 * MFA_SECURITY_ACTION audit row. No business data is touched.
 */
export function Aal2Probe() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SecurityProbeResult | null>(null);

  async function handleRun() {
    setBusy(true);
    setResult(null);
    const next = await runOwnerSecurityProbeAction();
    setResult(next);
    setBusy(false);
  }

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="type-section-title">AAL2 enforcement check</h2>
      <p className="type-meta mt-3">
        Runs a security probe that is permitted only with a verified owner MFA
        (AAL2) session. The action writes an audit-log entry and changes no
        business data.
      </p>
      <div className="mt-4">
        <button
          type="button"
          onClick={handleRun}
          disabled={busy}
          className="noore-button--auth-primary type-button min-w-44 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Checking…" : "Run AAL2 security probe"}
        </button>
      </div>
      {result ? (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 border px-4 py-3 text-sm ${
            result.status === "ok"
              ? "border-[var(--color-champagne)] bg-[var(--color-surface-muted)] text-[var(--color-obsidian)]"
              : "border-[var(--color-crimson)] bg-[var(--color-surface-muted)] text-[var(--color-crimson)]"
          }`}
        >
          {result.message}
          {result.status === "mfa_required" ? (
            <span className="mt-1 block">Complete the MFA challenge above, then try again.</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
