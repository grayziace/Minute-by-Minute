"use client";

export function SettingsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-32 pt-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl">Settings</h1>
      </header>

      <section className="space-y-6">
        <div>
          <h2 className="text-xs uppercase tracking-wider text-muted">Privacy</h2>
          <p className="mt-2 text-sm">Default visibility: Private</p>
          <p className="text-sm text-muted">All content is private unless you change it.</p>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-wider text-muted">Location</h2>
          <p className="mt-2 text-sm">Display: Approximate</p>
          <p className="text-sm text-muted">Exact coordinates stored but not exposed by default.</p>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-wider text-muted">Data</h2>
          <p className="mt-2 text-sm text-muted">
            Original media is never deleted by edits. Export coming in a future update.
          </p>
        </div>
      </section>
    </main>
  );
}
