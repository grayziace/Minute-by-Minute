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
      return "Passkey was cancelled or blocked.";
    }
    if (err.name === "SecurityError") {
      return "Passkey blocked — use https on the live site URL.";
    }
    return err.message;
  }
  return "Passkey failed. Please try again.";
}

export function LoginPage() {
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);

  useEffect(() => {
    fetch("/api/auth/passkey")
      .then(async (r) => {
        const d = (await r.json()) as {
          registered?: boolean;
          hasPassword?: boolean;
          setupError?: string;
          error?: string;
        };
        if (d.setupError) setSetupError(d.setupError);
        setRegistered(!!d.registered);
        setHasPassword(!!d.hasPassword);
      })
      .catch(() => {
        setSetupError("Could not reach the server. Check that the site deployed correctly.");
        setRegistered(false);
        setHasPassword(false);
      });
  }, []);

  async function createPassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (password !== confirm) {
      setMessage("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-password", password }),
      });
      const result = await res.json();
      if (res.ok) {
        window.location.href = "/";
      } else {
        setMessage(result.error ?? "Could not set password.");
      }
    } catch {
      setMessage("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function loginPassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "password-login", password }),
      });
      const result = await res.json();
      if (res.ok) {
        window.location.href = "/";
      } else {
        setMessage(result.error ?? "Incorrect password.");
      }
    } catch {
      setMessage("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

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
  const loading = registered === null || hasPassword === null;
  const creating = !loading && !hasPassword;

  return (
    <PageShell className="flex min-h-[80vh] flex-col justify-center">
      <GlassPanel strong className="memory-appear px-8 py-12 text-center max-w-md mx-auto w-full">
        <h1 className="text-3xl font-semibold text-gradient-angel">Minute by Minute</h1>
        <p className="mt-3 text-sm text-muted">Your private archive — sign in to write.</p>

        {setupError && (
          <div className="mt-6 rounded-md border border-[var(--blush)] bg-[var(--surface-strong)] px-4 py-3 text-left text-sm text-[var(--foreground-soft)] leading-relaxed">
            <p className="font-medium text-[var(--foreground)]">Setup needed</p>
            <p className="mt-2">{setupError}</p>
          </div>
        )}

        {loading && (
          <p className="mt-10 text-sm text-muted">Loading…</p>
        )}

        {!loading && !blocked && creating && (
          <form className="mt-10 space-y-4 text-left" onSubmit={(e) => void createPassword(e)}>
            <p className="text-sm text-muted text-center">Create a password for your archive.</p>
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="mt-1 w-full rounded-md border border-border/40 bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted">Confirm</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="mt-1 w-full rounded-md border border-border/40 bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-gradient-to-r from-ice/80 to-blush/60 py-3.5 text-[10px] uppercase tracking-[0.2em] text-midnight disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create password & sign in"}
            </button>
          </form>
        )}

        {!loading && !blocked && hasPassword && (
          <form className="mt-10 space-y-4 text-left" onSubmit={(e) => void loginPassword(e)}>
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                autoFocus
                className="mt-1 w-full rounded-md border border-border/40 bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-gradient-to-r from-ice/80 to-blush/60 py-3.5 text-[10px] uppercase tracking-[0.2em] text-midnight disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {!loading && !blocked && (
          <div className="mt-6">
            <button
              type="button"
              className="text-[10px] uppercase tracking-widest text-muted hover:text-foreground-soft"
              onClick={() => setShowPasskey((v) => !v)}
            >
              {showPasskey ? "Hide passkey options" : "Use passkey instead"}
            </button>
            {showPasskey && (
              <div className="mt-4 space-y-3">
                {registered === false && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void registerPasskey()}
                    className="glass w-full py-3 text-[10px] uppercase tracking-[0.2em] text-foreground-soft disabled:opacity-50"
                  >
                    Register passkey
                  </button>
                )}
                {registered && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void loginPasskey()}
                    className="glass w-full py-3 text-[10px] uppercase tracking-[0.2em] text-foreground-soft disabled:opacity-50"
                  >
                    Sign in with passkey
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {message && (
          <p className="mt-4 text-sm text-muted leading-relaxed" role="status">
            {message}
          </p>
        )}
      </GlassPanel>
    </PageShell>
  );
}
