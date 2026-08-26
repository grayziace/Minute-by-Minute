"use client";

import { useEffect, useState } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";

function passkeyErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "NotAllowedError") {
      return "Passkey was cancelled or blocked. Allow the prompt, or try a browser that supports passkeys (Chrome, Safari, Edge).";
    }
    if (err.name === "SecurityError") {
      return "Passkey blocked by browser security. Make sure you are on the live site URL (https), not an old preview link.";
    }
    return err.message;
  }
  return "Passkey failed. Please try again.";
}

export function LoginPage() {
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/passkey")
      .then(async (r) => {
        const d = (await r.json()) as {
          registered?: boolean;
          setupError?: string;
          error?: string;
        };
        if (d.setupError) setSetupError(d.setupError);
        setRegistered(!!d.registered);
      })
      .catch(() => {
        setSetupError("Could not reach the server. Check that the site deployed correctly.");
        setRegistered(false);
      });
  }, []);

  async function registerPasskey() {
    setMessage("");
    setBusy(true);
    try {
      const optRes = await fetch("/api/auth/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register-options" }),
      });
      const options = await optRes.json();
      if (!optRes.ok) {
        setMessage(options.error ?? "Could not start passkey registration.");
        return;
      }

      const credential = await startRegistration({ optionsJSON: options });

      const verifyRes = await fetch("/api/auth/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register-verify", credential }),
      });
      const result = await verifyRes.json();
      if (verifyRes.ok) {
        setMessage("Passkey registered. Taking you home…");
        window.location.href = "/";
      } else {
        setMessage(result.error ?? "Registration failed.");
      }
    } catch (err) {
      setMessage(passkeyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function loginPasskey() {
    setMessage("");
    setBusy(true);
    try {
      const optRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login-options" }),
      });
      const options = await optRes.json();
      if (!optRes.ok) {
        setMessage(options.error ?? "Could not start sign in.");
        return;
      }

      const credential = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login-verify", credential }),
      });
      const result = await verifyRes.json();
      if (verifyRes.ok) {
        window.location.href = "/";
      } else {
        setMessage(result.error ?? "Login failed.");
      }
    } catch (err) {
      setMessage(passkeyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const blocked = !!setupError;

  return (
    <PageShell className="flex min-h-[80vh] flex-col justify-center">
      <GlassPanel strong className="memory-appear px-8 py-12 text-center">
        <h1 className="text-3xl font-semibold text-gradient-angel">Minute by Minute</h1>
        <p className="mt-3 text-sm text-muted">Private archive. Passkey access.</p>

        {setupError && (
          <div className="mt-6 rounded-md border border-[var(--blush)] bg-[var(--surface-strong)] px-4 py-3 text-left text-sm text-[var(--foreground-soft)] leading-relaxed">
            <p className="font-medium text-[var(--foreground)]">Setup needed before passkeys work</p>
            <p className="mt-2">{setupError}</p>
            <p className="mt-3 text-xs text-muted">
              In Vercel: Project → Settings → Environment Variables → add{" "}
              <code className="rounded bg-black/5 px-1">DATABASE_URL</code> from Neon, then Redeploy.
            </p>
          </div>
        )}

        <div className="mt-10 space-y-4">
          {registered === false && (
            <button
              type="button"
              disabled={busy || blocked}
              onClick={() => void registerPasskey()}
              className="w-full rounded-full bg-gradient-to-r from-ice/80 to-blush/60 py-3.5 text-[10px] uppercase tracking-[0.2em] text-midnight disabled:opacity-50"
            >
              {busy ? "Waiting for device…" : "Register passkey"}
            </button>
          )}
          {registered && (
            <button
              type="button"
              disabled={busy || blocked}
              onClick={() => void loginPasskey()}
              className="glass w-full py-3.5 text-[10px] uppercase tracking-[0.2em] text-foreground-soft disabled:opacity-50"
            >
              {busy ? "Waiting for device…" : "Sign in with passkey"}
            </button>
          )}
          {message && (
            <p className="text-sm text-muted leading-relaxed" role="status">
              {message}
            </p>
          )}
        </div>
      </GlassPanel>
    </PageShell>
  );
}
