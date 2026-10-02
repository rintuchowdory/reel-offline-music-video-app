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
  }),

  playlists: defineTable({
    ownerTokenIdentifier: v.string(),
    name: v.string(),
  }).index("by_owner", ["ownerTokenIdentifier"]),

  // Separate table so playlists can grow without bloating one document
  playlistItems: defineTable({
    playlistId: v.id("playlists"),
    videoId: v.id("videos"),
  })
    .index("by_playlist", ["playlistId"])
    .index("by_playlist_and_video", ["playlistId", "videoId"]),
});
