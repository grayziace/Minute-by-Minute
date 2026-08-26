"use client";

import { useState } from "react";
import Link from "next/link";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { EditModeGuard } from "@/components/layout/EditModeGuard";
import { useCharacters, type Character } from "@/lib/characters";

const EMPTY: Omit<Character, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  role: "",
  description: "",
  traits: "",
  notes: "",
};

export function CharactersPage() {
  return (
    <EditModeGuard>
      <CharactersPageInner />
    </EditModeGuard>
  );
}

function CharactersPageInner() {
  const { characters, save, remove } = useCharacters();
  const [editing, setEditing] = useState<Character | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  function openNew() {
    setEditing(null);
    setDraft(EMPTY);
    setFormOpen(true);
  }

  function openEdit(char: Character) {
    setEditing(char);
    setFormOpen(true);
    setDraft({
      name: char.name,
      role: char.role,
      description: char.description,
      traits: char.traits,
      notes: char.notes,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setBusy(true);
    if (editing) {
      await save({ ...draft, id: editing.id });
    } else {
      await save(draft);
    }
    setBusy(false);
    setEditing(null);
    setDraft(EMPTY);
    setFormOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this character?")) return;
    await remove(id);
    if (editing?.id === id) {
      setEditing(null);
      setDraft(EMPTY);
    }
  }

  const showForm = formOpen || characters.length === 0;

  return (
    <StorybookShell>
      <div className="frame-spread memory-appear">
        <header className="studio-spread__header">
          <Link href="/archive/ai" className="day-chapter__back">
            ← Studios
          </Link>
          <h1 className="spread-title">Characters</h1>
          <p className="spread-subtitle">
            The cast of your story — create once, edit anytime for consistent manga chapters.
          </p>
        </header>

        <div className="characters-layout">
          <div className="characters-grid">
            {characters.map((char) => (
              <article key={char.id} className="character-card paper-note paper-note--taped">
                <p className="storybook-widget__title">{char.role || "Character"}</p>
                <h2 className="character-card__name">{char.name}</h2>
                {char.description && <p className="character-card__desc">{char.description}</p>}
                {char.traits && <p className="character-card__traits">{char.traits}</p>}
                {char.notes && <p className="character-card__notes">{char.notes}</p>}
                <div className="character-card__actions">
                  <button type="button" className="storybook-widget__link" onClick={() => openEdit(char)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="character-card__delete"
                    onClick={() => void handleDelete(char.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}

            {!formOpen && (
              <button type="button" className="character-card character-card--new" onClick={openNew}>
                <span className="character-card__plus">+</span>
                <span>New character</span>
              </button>
            )}
          </div>

          {(showForm) && (
            <form className="character-form paper-note" onSubmit={(e) => void handleSave(e)}>
              <p className="storybook-widget__title">
                {editing ? `Editing ${editing.name}` : "New character"}
              </p>
              <label className="character-form__field">
                Name
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Yueling"
                  required
                />
              </label>
              <label className="character-form__field">
                Role
                <input
                  value={draft.role}
                  onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                  placeholder="main character"
                />
              </label>
              <label className="character-form__field">
                Description
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  rows={3}
                  placeholder="Who they are in your story…"
                />
              </label>
              <label className="character-form__field">
                Visual traits
                <textarea
                  value={draft.traits}
                  onChange={(e) => setDraft((d) => ({ ...d, traits: e.target.value }))}
                  rows={2}
                  placeholder="Hair down, confused expression when lost…"
                />
              </label>
              <label className="character-form__field">
                Notes
                <textarea
                  value={draft.notes}
                  onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                  rows={2}
                  placeholder="Anything the manga should remember"
                />
              </label>
              <div className="studio-panel__actions">
                {editing && (
                  <button
                    type="button"
                    className="studio-panel__ghost"
                    onClick={() => {
                      setEditing(null);
                      setDraft(EMPTY);
                      setFormOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="studio-panel__primary" disabled={busy || !draft.name.trim()}>
                  {busy ? "Saving…" : editing ? "Save changes" : "Create character"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </StorybookShell>
  );
}
