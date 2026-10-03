import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    // The first user to sign in becomes the admin who manages the catalog
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  }).index("by_token", ["tokenIdentifier"]),

  videos: defineTable({
    title: v.string(),
    artist: v.string(),
    videoStorageId: v.id("_storage"),
    thumbnailStorageId: v.optional(v.id("_storage")),
  })
    .index("by_artist", ["artist"])
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_artist", { searchField: "artist" }),

  playlists: defineTable({
    ownerTokenIdentifier: v.string(),
    name: v.string(),
  }).index("by_owner", ["ownerTokenIdentifier"]),

  // Separate table so playlists can grow without bloating one document
  playlistItems: defineTable({
    playlistId: v.id("playlists"),
    videoId: v.id("videos"),
    // Manual order set by the reorder mutation; undefined = legacy insertion order
    position: v.optional(v.number()),
  })
    .index("by_playlist", ["playlistId"])
    .index("by_playlist_and_video", ["playlistId", "videoId"]),
});
