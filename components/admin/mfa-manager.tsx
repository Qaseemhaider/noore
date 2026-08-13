"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Factor = {
  id: string;
  friendly_name: string | null | undefined;
  factor_type: string;
  status: string;
};

type MfaManagerProps = {
  initialAal: "aal1" | "aal2" | null;
  isOwner: boolean;
};

const FOCUS_INPUT =
  "min-h-11 w-full border border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-crimson)]";

function formatFactorError(error: { code?: string; message?: string } | null): string {
  if (!error) return "Something went wrong.";
  const code = error.code ?? "";
  const message = error.message?.toLowerCase() ?? "";
  if (code === "invalid_totp" || message.includes("invalid token") || message.includes("invalid code")) {
    return "That code was not accepted. Check the code in your authenticator and try again.";
  }
  if (message.includes("time used") || message.includes("time-based")) {
    return "That code has expired. Use a fresh code from your authenticator app.";
  }
  if (message.includes("factor") && message.includes("not found")) {
    return "This authenticator is no longer valid. Unenroll and enroll again.";
  }
  return "Unable to complete that step. Please try again.";
}

export function MfaManager({ initialAal, isOwner }: MfaManagerProps) {
  const router = useRouter();
  const [aal, setAal] = useState<"aal1" | "aal2" | null>(initialAal);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Enrollment flow state
  const [enrolling, setEnrolling] = useState(false);
  const [pendingFactor, setPendingFactor] = useState<Factor | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) {
      setError(formatFactorError(listError));
      setFactors([]);
    } else {
      setError(null);
      setFactors(
        (data?.all ?? []).map((f) => ({
          id: f.id,
          friendly_name: f.friendly_name ?? null,
          factor_type: f.factor_type,
          status: f.status,
        })) as Factor[],
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const verifiedFactor = factors.find((f) => f.status === "verified" && f.factor_type === "totp") ?? null;

  const challengeCode = async (factorId: string, value: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: value,
    });
    if (error) {
      setError(formatFactorError(error));
      return false;
    }
    setCode("");
    setNotice("Authenticator verified — your session is now AAL2.");
    setAal("aal2");
    refresh();
    return true;
  };

  async function handleEnroll() {
    setError(null);
    setNotice(null);
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "NOORE owner authenticator",
    });
    setBusy(false);
    if (error) {
      setError(formatFactorError(error));
      return;
    }
    setEnrolling(true);
    setPendingFactor({ id: data.id, friendly_name: data.friendly_name, factor_type: data.type, status: "unverified" });
    setQrCode(data.totp.qr_code ?? null);
    setSetupSecret(data.totp.secret ?? null);
  }

  async function handleSubmitEnrollmentCode() {
    if (!pendingFactor || !code.trim()) return;
    setBusy(true);
    setError(null);
    const ok = await challengeCode(pendingFactor.id, code.trim());
    setBusy(false);
    if (ok) {
      setEnrolling(false);
      setPendingFactor(null);
      setQrCode(null);
      setSetupSecret(null);
      await load();
    }
  }

  async function handleChallenge() {
    if (!verifiedFactor || !code.trim()) return;
    setBusy(true);
    setError(null);
    await challengeCode(verifiedFactor.id, code.trim());
    setBusy(false);
  }

  async function handleUnenroll() {
    if (!verifiedFactor) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
    setBusy(false);
    if (error) {
      setError(formatFactorError(error));
      return;
    }
    setNotice("Authenticator removed.");
    setAal("aal1");
    await load();
    refresh();
  }

  const status = aal === "aal2" ? "aal2" : verifiedFactor ? "aal1" : "none";

  return (
    <div>
      <div role="status" aria-live="polite" className="mb-5">
        {notice ? <p className="text-sm text-[var(--color-muted)]">{notice}</p> : null}
      </div>
      {error ? (
        <p role="alert" className="mb-5 border border-[var(--color-crimson)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-crimson)]">
          {error}
        </p>
      ) : null}

      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="type-section-title">Two-factor authentication</h2>

        {loading ? (
          <p className="type-meta mt-4">Checking your authenticator…</p>
        ) : (
          <>
            <dl className="mt-4 grid max-w-[36rem] gap-3 sm:grid-cols-2">
              <div>
                <dt className="type-meta font-semibold">Status</dt>
                <dd className="mt-1 font-semibold">
                  {status === "aal2" ? "Active (AAL2)" : status === "aal1" ? "Enrolled — challenge pending" : "Not enrolled"}
                </dd>
              </div>
              <div>
                <dt className="type-meta font-semibold">Session assurance</dt>
                <dd className="mt-1">{aal === "aal2" ? "AAL2 — verified this session" : "AAL1 — MFA not yet verified"}</dd>
              </div>
            </dl>

            {isOwner ? (
              <p className="type-meta mt-4">
                Sensitive owner actions require a verified AAL2 session. Enrolling a TOTP
                authenticator here protects pricing, inventory, staff and security changes in
                later phases.
              </p>
            ) : null}

            {/* Not enrolled */}
            {status === "none" && !enrolling ? (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={busy}
                  className="noore-button--auth-primary type-button mt-2 min-w-44"
                >
                  {busy ? "Preparing…" : "Enroll an authenticator"}
                </button>
              </div>
            ) : null}

            {/* Enrollment in progress */}
            {enrolling && pendingFactor && qrCode ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr]">
                <div>
                  {/* QR code for scanning into the authenticator app */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- QR is an SVG data URL; the optimizer cannot process it */}
                  <img
                    src={qrCode}
                    alt="QR code to scan with your authenticator app to enroll TOTP"
                    width={180}
                    height={180}
                    className="h-44 w-44 border border-[var(--color-border)] bg-white object-contain"
                  />
                </div>
                <div>
                  <p className="type-meta">
                    Open your authenticator app and scan the QR code. If you cannot scan it,
                    enter this setup key manually:
                  </p>
                  <p className="mt-2 break-all font-mono text-sm">{setupSecret}</p>
                  <div className="mt-4">
                    <label htmlFor="mfa-enroll-code" className="type-meta mb-2 block font-semibold">
                      Enter the 6-digit code
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        id="mfa-enroll-code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                        maxLength={6}
                        value={code}
                        onChange={(event) => {
                          setCode(event.target.value.replace(/\D/g, ""));
                          setError(null);
                        }}
                        className={`${FOCUS_INPUT} w-40 text-center text-lg tracking-[0.35em]`}
                      />
                      <button
                        type="button"
                        onClick={handleSubmitEnrollmentCode}
                        disabled={busy || code.length !== 6}
                        className="noore-button--auth-primary type-button min-w-40 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? "Verifying…" : "Verify and activate"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Enrolled but session is AAL1 */}
            {status === "aal1" && !enrolling ? (
              <div className="mt-6">
                <label htmlFor="mfa-challenge-code" className="type-meta mb-2 block font-semibold">
                  Enter your current 6-digit code
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    id="mfa-challenge-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    maxLength={6}
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value.replace(/\D/g, ""));
                      setError(null);
                    }}
                    className={`${FOCUS_INPUT} w-40 text-center text-lg tracking-[0.35em]`}
                  />
                  <button
                    type="button"
                    onClick={handleChallenge}
                    disabled={busy || code.length !== 6}
                    className="noore-button--auth-primary type-button min-w-40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Verifying…" : "Verify session"}
                  </button>
                </div>
              </div>
            ) : null}

            {/* AAL2 active */}
            {status === "aal2" ? (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <p className="text-sm text-[var(--color-muted)]">
                  This session is protected by two-factor authentication.
                </p>
                <button
                  type="button"
                  onClick={handleUnenroll}
                  disabled={busy}
                  className="type-button px-3 py-2 text-[var(--color-crimson)] underline underline-offset-3 hover:text-[var(--color-crimson-hover)]"
                >
                  {busy ? "Removing…" : "Remove authenticator"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
