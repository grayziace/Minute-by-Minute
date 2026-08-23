import {
  pgTable,
  text,
  timestamp,
  uuid,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  primaryKey,
  index,
  customType,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const recordedAtPrecisionEnum = pgEnum("recorded_at_precision", [
  "exact",
  "approximate",
  "unknown",
]);
export const locationPrivacyEnum = pgEnum("location_privacy", [
  "hidden",
  "approximate",
  "exact",
]);
export const visibilityEnum = pgEnum("visibility", [
  "private",
  "unlisted",
  "shared",
  "public",
]);
export const contentSourceEnum = pgEnum("content_source", [
  "user",
  "ai_suggested",
]);
export const syncStatusEnum = pgEnum("sync_status", [
  "pending",
  "synced",
  "failed",
]);
export const uploadStatusEnum = pgEnum("upload_status", [
  "pending",
  "uploading",
  "processing",
  "ready",
  "failed",
]);
export const inboxStatusEnum = pgEnum("inbox_status", [
  "unprocessed",
  "reviewed",
  "placed",
  "dismissed",
]);
export const variantTypeEnum = pgEnum("variant_type", [
  "thumbnail",
  "preview",
  "poster",
  "transcoded",
]);
export const placeTypeEnum = pgEnum("place_type", [
  "school",
  "apartment",
  "hotel",
  "restaurant",
  "cafe",
  "club",
  "metro",
  "park",
  "beach",
  "city",
  "neighbourhood",
  "other",
]);
export const musicRoleEnum = pgEnum("music_role", ["moment", "song_of_day"]);
export const aiJobStatusEnum = pgEnum("ai_job_status", [
  "queued",
  "running",
  "completed",
  "failed",
]);
export const aiSuggestionStatusEnum = pgEnum("ai_suggestion_status", [
  "pending",
  "accepted",
  "rejected",
]);
export const editProjectStatusEnum = pgEnum("edit_project_status", [
  "draft",
  "proposed",
  "approved",
  "rendered",
]);
export const scrapbookScopeTypeEnum = pgEnum("scrapbook_scope_type", [
  "day",
  "custom_collection",
]);
export const transcriptSourceEnum = pgEnum("transcript_source", [
  "user",
  "ai",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const passkeyCredentials = pgTable("passkey_credentials", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").notNull().default(0),
  transports: text("transports"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const entries = pgTable(
  "entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    recordedAtPrecision: recordedAtPrecisionEnum("recorded_at_precision")
      .notNull()
      .default("exact"),
    text: text("text"),
    moodNote: text("mood_note"),
    locationName: text("location_name"),
    locationLat: doublePrecision("location_lat"),
    locationLng: doublePrecision("location_lng"),
    locationAccuracy: doublePrecision("location_accuracy"),
    locationPrivacy: locationPrivacyEnum("location_privacy")
      .notNull()
      .default("approximate"),
    visibility: visibilityEnum("visibility").notNull().default("private"),
    source: contentSourceEnum("source").notNull().default("user"),
    syncStatus: syncStatusEnum("sync_status").notNull().default("synced"),
    clientId: text("client_id"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("entries_user_recorded_idx").on(table.userId, table.recordedAt),
    index("entries_client_id_idx").on(table.clientId),
  ],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entryId: uuid("entry_id").references(() => entries.id, {
      onDelete: "set null",
    }),
    storageKey: text("storage_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    sha256: text("sha256"),
    capturedAt: timestamp("captured_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    exifJson: jsonb("exif_json"),
    gpsJson: jsonb("gps_json"),
    uploadStatus: uploadStatusEnum("upload_status")
      .notNull()
      .default("pending"),
    uploadMultipartId: text("upload_multipart_id"),
    visibility: visibilityEnum("visibility").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("media_assets_user_idx").on(table.userId),
    index("media_assets_entry_idx").on(table.entryId),
    index("media_assets_sha256_idx").on(table.sha256),
  ],
);

export const mediaVariants = pgTable("media_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  mediaAssetId: uuid("media_asset_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "cascade" }),
  variantType: variantTypeEnum("variant_type").notNull(),
  storageKey: text("storage_key").notNull(),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inboxItems = pgTable("inbox_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  mediaAssetId: uuid("media_asset_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "cascade" }),
  suggestedDate: timestamp("suggested_date", { withTimezone: true }),
  suggestedLocation: text("suggested_location"),
  suggestedGroupId: text("suggested_group_id"),
  aiMetadataJson: jsonb("ai_metadata_json"),
  status: inboxStatusEnum("status").notNull().default("unprocessed"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  (table) => [index("tags_user_name_idx").on(table.userId, table.name)],
);

export const entryTags = pgTable(
  "entry_tags",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.tagId] })],
);

export const entriesSearch = pgTable("entries_search", {
  entryId: uuid("entry_id")
    .primaryKey()
    .references(() => entries.id, { onDelete: "cascade" }),
  document: tsvector("document"),
});

export const scrapbookLayouts = pgTable("scrapbook_layouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scopeType: scrapbookScopeTypeEnum("scope_type").notNull(),
  scopeId: text("scope_id").notNull(),
  layoutJson: jsonb("layout_json").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Phase 2
export const people = pgTable("people", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  nickname: text("nickname"),
  photoMediaId: uuid("photo_media_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  visibility: visibilityEnum("visibility").notNull().default("private"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const entryPeople = pgTable(
  "entry_people",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.personId] })],
);

export const places = pgTable("places", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  placeType: placeTypeEnum("place_type").notNull().default("other"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  address: text("address"),
  amapPoiId: text("amap_poi_id"),
  notes: text("notes"),
  visibility: visibilityEnum("visibility").notNull().default("private"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const entryPlaces = pgTable(
  "entry_places",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    placeId: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.placeId] })],
);

export const placeVisits = pgTable("place_visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  placeId: uuid("place_id")
    .notNull()
    .references(() => places.id, { onDelete: "cascade" }),
  visitedAt: timestamp("visited_at", { withTimezone: true }).notNull(),
  entryId: uuid("entry_id").references(() => entries.id, {
    onDelete: "set null",
  }),
});

export const musicTracks = pgTable("music_tracks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  artist: text("artist"),
  album: text("album"),
  externalUrl: text("external_url"),
  isrc: text("isrc"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const entryMusic = pgTable(
  "entry_music",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    musicTrackId: uuid("music_track_id")
      .notNull()
      .references(() => musicTracks.id, { onDelete: "cascade" }),
    role: musicRoleEnum("role").notNull().default("moment"),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.musicTrackId] })],
);

// Phase 3
export const aiJobs = pgTable("ai_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  status: aiJobStatusEnum("status").notNull().default("queued"),
  inputJson: jsonb("input_json"),
  outputJson: jsonb("output_json"),
  costEstimate: doublePrecision("cost_estimate"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  suggestionType: text("suggestion_type").notNull(),
  contentJson: jsonb("content_json").notNull(),
  status: aiSuggestionStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const editProjects = pgTable("edit_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: editProjectStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const editClips = pgTable("edit_clips", {
  id: uuid("id").primaryKey().defaultRandom(),
  editProjectId: uuid("edit_project_id")
    .notNull()
    .references(() => editProjects.id, { onDelete: "cascade" }),
  sourceMediaId: uuid("source_media_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  inMs: integer("in_ms").notNull().default(0),
  outMs: integer("out_ms"),
  orderIndex: integer("order_index").notNull(),
  transition: text("transition").default("cut"),
  speed: doublePrecision("speed").default(1),
  cropJson: jsonb("crop_json"),
  audioTreatment: text("audio_treatment").default("keep"),
  textOverlaysJson: jsonb("text_overlays_json"),
  musicTrackId: uuid("music_track_id").references(() => musicTracks.id, {
    onDelete: "set null",
  }),
});

export const editRevisions = pgTable("edit_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  editProjectId: uuid("edit_project_id")
    .notNull()
    .references(() => editProjects.id, { onDelete: "cascade" }),
  instructionText: text("instruction_text"),
  edlSnapshotJson: jsonb("edl_snapshot_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const renderedVideos = pgTable("rendered_videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  editProjectId: uuid("edit_project_id")
    .notNull()
    .references(() => editProjects.id, { onDelete: "cascade" }),
  editRevisionId: uuid("edit_revision_id").references(() => editRevisions.id, {
    onDelete: "set null",
  }),
  mediaAssetId: uuid("media_asset_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const transcripts = pgTable("transcripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  mediaAssetId: uuid("media_asset_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  source: transcriptSourceEnum("source").notNull().default("ai"),
  language: text("language"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const entriesRelations = relations(entries, ({ many, one }) => ({
  user: one(users, { fields: [entries.userId], references: [users.id] }),
  mediaAssets: many(mediaAssets),
  entryTags: many(entryTags),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  entry: one(entries, {
    fields: [mediaAssets.entryId],
    references: [entries.id],
  }),
  variants: many(mediaVariants),
  inboxItem: one(inboxItems),
}));

export const searchVectorSql = sql`
  setweight(to_tsvector('english', coalesce(${entries.text}, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(${entries.locationName}, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(${entries.moodNote}, '')), 'C')
`;
