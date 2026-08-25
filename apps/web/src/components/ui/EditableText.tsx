"use client";

import { useEffect, useRef, useState } from "react";
import { useExperienceMode } from "@/lib/experience/mode";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  as?: "p" | "span" | "h1" | "h2";
}

export function EditableText({
  value,
  onSave,
  placeholder = "Click to edit…",
  multiline = false,
  className,
  as: Tag = "p",
}: EditableTextProps) {
  const { canEdit } = useExperienceMode();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  async function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) await onSave(trimmed);
  }

  if (!canEdit) {
    return (
      <Tag className={className}>
        {value || placeholder}
      </Tag>
    );
  }

  if (editing) {
    const shared =
      "editable-text__input w-full resize-none bg-transparent outline-none border-b border-[var(--periwinkle)] text-[inherit] font-[inherit]";

    return multiline ? (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        rows={3}
        className={cn(shared, className)}
      />
    ) : (
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") void commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={cn(shared, className)}
      />
    );
  }

  return (
    <Tag
      role="button"
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setEditing(true);
        }
      }}
      className={cn("editable-text", !value && "editable-text--empty", className)}
      title="Click to edit"
    >
      {value || placeholder}
    </Tag>
  );
}
