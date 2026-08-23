"use client";

import { useEffect, useState } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function LoginPage() {
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/passkey")
      .then((r) => r.json())
      .then((d) => setRegistered(d.registered))
      .catch(() => setRegistered(false));
  }, []);

  async function registerPasskey() {
    setMessage("");
    const optRes = await fetch("/api/auth/passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register-options" }),
    });
    const options = await optRes.json();
    const credential = await startRegistration({ optionsJSON: options });
    const verifyRes = await fetch("/api/auth/passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register-verify", credential }),
    });
    if (verifyRes.ok) {
      setMessage("Passkey registered.");
      window.location.href = "/";
    } else {
      setMessage("Registration failed.");
    }
  }

  async function loginPasskey() {
    setMessage("");
    const optRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login-options" }),
    });
    const options = await optRes.json();
    const credential = await startAuthentication({ optionsJSON: options });
    const verifyRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login-verify", credential }),
    });
    if (verifyRes.ok) {
      window.location.href = "/";
    } else {
      setMessage("Login failed.");
    }
  }

  return (
    <PageShell className="flex min-h-[80vh] flex-col justify-center">
      <GlassPanel strong className="memory-appear px-8 py-12 text-center">
        <h1 className="font-serif text-3xl text-gradient-angel">Minute by Minute</h1>
        <p className="mt-3 text-sm text-muted">Private archive. Passkey access.</p>

        <div className="mt-10 space-y-4">
          {registered === false && (
            <button
              onClick={() => void registerPasskey()}
              className="w-full rounded-full bg-gradient-to-r from-ice/80 to-blush/60 py-3.5 text-[10px] uppercase tracking-[0.2em] text-midnight"
            >
              Register passkey
            </button>
          )}
          {registered && (
            <button
              onClick={() => void loginPasskey()}
              className="glass w-full py-3.5 text-[10px] uppercase tracking-[0.2em] text-foreground-soft"
            >
              Sign in with passkey
            </button>
          )}
          {message && <p className="text-sm text-muted">{message}</p>}
        </div>
      </GlassPanel>
    </PageShell>
  );
}
