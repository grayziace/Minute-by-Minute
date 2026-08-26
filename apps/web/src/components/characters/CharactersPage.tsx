"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { EditModeGuard } from "@/components/layout/EditModeGuard";
import { useCharacters, useCharacterPhotos, type Character } from "@/lib/characters";
import { queueFileUpload } from "@/lib/uploads/client";

const EMPTY: Omit<Character, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  role: "",
  description: "",
  traits: "",
  notes: "",
  photoMediaIds: [],
};

export function CharactersPage() {
  return (
    <EditModeGuard>
      <CharactersPageInner />
    </EditModeGuard>
  );
}

function CharacterCard({ char, onEdit, onDelete }: {
  char: Character;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photos = useCharacterPhotos(char.photoMediaIds);

  return (
    <article className="character-card paper-note paper-note--taped">
      {photos.length > 0 && (
        <div className={`character-card__photos character-card__photos--${Math.min(photos.length, 4)}`}>
          {photos.slice(0, 4).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.localBlobUrl!} alt="" className="character-card__photo" />
          ))}
          {photos.length > 4 && (
            <span className="character-card__photo-more">+{photos.length - 4}</span>
          )}
        </div>
      )}
      <p className="storybook-widget__title">{char.role || "Character"}</p>
      <h2 className="character-card__name">{char.name}</h2>
      {char.description && <p className="character-card__desc">{char.description}</p>}
      {char.traits && <p className="character-card__traits">{char.traits}</p>}
      {char.notes && <p className="character-card__notes">{char.notes}</p>}
      <p className="character-card__photo-count">
        {photos.length} reference photo{photos.length === 1 ? "" : "s"}
      </p>
      <div className="character-card__actions">
        <button type="button" className="storybook-widget__link" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="character-card__delete" onClick={onDelete}>
          Remove
        </button>
      </div>
    </article>
  );
}

function CharactersPageInner() {
  const { characters, save, remove } = useCharacters();
  const [editing, setEditing] = useState<Character | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  function openNew() {
    setEditing(null);
    setDraft(EMPTY);
    setPhotoIds([]);
    setFormOpen(true);
  }

  function openEdit(char: Character) {
    setEditing(char);
    setFormOpen(true);
    setPhotoIds(char.photoMediaIds ?? []);
    setDraft({
      name: char.name,
      role: char.role,
      description: char.description,
      traits: char.traits,
      notes: char.notes,
      photoMediaIds: char.photoMediaIds ?? [],
    });
  }

  async function handlePhotos(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const newIds: string[] = [];
    for (const file of Array.from(files)) {
      const asset = await queueFileUpload(file, { entryId: null, toInbox: false });
      newIds.push(asset.id);
    }
    setPhotoIds((prev) => [...prev, ...newIds]);
    setBusy(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setBusy(true);
    const payload = { ...draft, photoMediaIds: photoIds };
    if (editing) {
      await save({ ...payload, id: editing.id });
    } else {
      await save(payload);
    }
    setBusy(false);
    setEditing(null);
    setDraft(EMPTY);
    setPhotoIds([]);
    setFormOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this character?")) return;
    await remove(id);
    if (editing?.id === id) {
      setEditing(null);
      setDraft(EMPTY);
      setPhotoIds([]);
    }
  }

  const showForm = formOpen || characters.length === 0;
  const formPhotos = useCharacterPhotos(photoIds);

  return (
    <StorybookShell>
      <div className="page-spread frame-spread memory-appear">
        <header className="page-spread__header studio-spread__header">
          <Link href="/archive/ai" className="day-chapter__back">
            ← Studios
          </Link>
          <h1 className="spread-title spread-title--vivid">Characters</h1>
          <p className="spread-subtitle">
            Build your cast with words and photos — many reference shots help the manga stay consistent.
          </p>
        </header>

        <div className="characters-layout">
          <div className="characters-grid">
            {characters.map((char) => (
              <CharacterCard
                key={char.id}
                char={char}
                onEdit={() => openEdit(char)}
                onDelete={() => void handleDelete(char.id)}
              />
            ))}

            {!formOpen && (
              <button type="button" className="character-card character-card--new" onClick={openNew}>
                <span className="character-card__plus">+</span>
                <span>New character</span>
              </button>
            )}
          </div>

          {showForm && (
            <form className="character-form paper-note paper-note--lavender" onSubmit={(e) => void handleSave(e)}>
              <p className="storybook-widget__title">
                {editing ? `Editing ${editing.name}` : "New character"}
              </p>

              <div className="character-form__photos">
                <p className="character-form__photos-label">Reference photos</p>
                <div className="character-form__photo-grid">
                  {formPhotos.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.id} src={p.localBlobUrl!} alt="" className="character-form__photo-thumb" />
                  ))}
                  <button
                    type="button"
                    className="character-form__photo-add"
                    disabled={busy}
                    onClick={() => photoRef.current?.click()}
                  >
                    + Add photos
                  </button>
                </div>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void handlePhotos(e.target.files)}
                />
                <p className="character-form__photos-hint">
                  Add as many as you like — different angles, outfits, expressions.
                </p>
              </div>

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
                      setPhotoIds([]);
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
