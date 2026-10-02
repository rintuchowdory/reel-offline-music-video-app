import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel.d.ts";

const MAX_PLAYLIST_ITEMS = 200;

async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not signed in" });
  }
  return identity;
}

async function getOwnedPlaylist(
  ctx: QueryCtx | MutationCtx,
  playlistId: Id<"playlists">,
): Promise<Doc<"playlists">> {
  const identity = await requireIdentity(ctx);
  const playlist = await ctx.db.get("playlists", playlistId);
  if (!playlist) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Playlist not found" });
  }
  if (playlist.ownerTokenIdentifier !== identity.tokenIdentifier) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Not your playlist" });
  }
  return playlist;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    return await ctx.db
      .query("playlists")
      .withIndex("by_owner", (q) => q.eq("ownerTokenIdentifier", identity.tokenIdentifier))
      .order("desc")
      .take(100);
  },
});

// Which of the user's playlists already contain this video
export const listForVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const playlists = await ctx.db
      .query("playlists")
      .withIndex("by_owner", (q) => q.eq("ownerTokenIdentifier", identity.tokenIdentifier))
      .order("desc")
      .take(100);
    return await Promise.all(
      playlists.map(async (p) => {
        const existing = await ctx.db
          .query("playlistItems")
          .withIndex("by_playlist_and_video", (q) =>
            q.eq("playlistId", p._id).eq("videoId", args.videoId),
          )
          .first();
        return { _id: p._id, name: p.name, contains: existing !== null };
      }),
    );
  },
});

export const get = query({
  args: { id: v.id("playlists") },
  handler: async (ctx, args) => {
    const playlist = await getOwnedPlaylist(ctx, args.id);
    const items = await ctx.db
      .query("playlistItems")
      .withIndex("by_playlist", (q) => q.eq("playlistId", args.id))
      .take(MAX_PLAYLIST_ITEMS);
    const videos = await Promise.all(
      items.map(async (item) => {
        const video = await ctx.db.get("videos", item.videoId);
        if (!video) return null;
        return {
          _id: video._id,
          title: video.title,
          artist: video.artist,
          videoUrl: await ctx.storage.getUrl(video.videoStorageId),
          thumbnailUrl: video.thumbnailStorageId
            ? await ctx.storage.getUrl(video.thumbnailStorageId)
            : null,
        };
      }),
    );
    return {
      _id: playlist._id,
      name: playlist.name,
      videos: videos.filter((x) => x !== null),
    };
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const name = args.name.trim();
    if (!name) throw new ConvexError({ code: "BAD_REQUEST", message: "Name is required" });
    return await ctx.db.insert("playlists", {
      ownerTokenIdentifier: identity.tokenIdentifier,
      name: name.slice(0, 80),
    });
  },
});

export const rename = mutation({
  args: { id: v.id("playlists"), name: v.string() },
  handler: async (ctx, args) => {
    await getOwnedPlaylist(ctx, args.id);
    const name = args.name.trim();
    if (!name) throw new ConvexError({ code: "BAD_REQUEST", message: "Name is required" });
    await ctx.db.patch("playlists", args.id, { name: name.slice(0, 80) });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("playlists") },
  handler: async (ctx, args) => {
    await getOwnedPlaylist(ctx, args.id);
    const items = await ctx.db
      .query("playlistItems")
      .withIndex("by_playlist", (q) => q.eq("playlistId", args.id))
      .take(MAX_PLAYLIST_ITEMS);
    for (const item of items) await ctx.db.delete("playlistItems", item._id);
    await ctx.db.delete("playlists", args.id);
    return null;
  },
});

export const addVideo = mutation({
  args: { playlistId: v.id("playlists"), videoId: v.id("videos") },
  handler: async (ctx, args) => {
    await getOwnedPlaylist(ctx, args.playlistId);
    const existing = await ctx.db
      .query("playlistItems")
      .withIndex("by_playlist_and_video", (q) =>
        q.eq("playlistId", args.playlistId).eq("videoId", args.videoId),
      )
      .first();
    if (existing) return null;
    await ctx.db.insert("playlistItems", args);
    return null;
  },
});

export const removeVideo = mutation({
  args: { playlistId: v.id("playlists"), videoId: v.id("videos") },
  handler: async (ctx, args) => {
    await getOwnedPlaylist(ctx, args.playlistId);
    const existing = await ctx.db
      .query("playlistItems")
      .withIndex("by_playlist_and_video", (q) =>
        q.eq("playlistId", args.playlistId).eq("videoId", args.videoId),
      )
      .first();
    if (existing) await ctx.db.delete("playlistItems", existing._id);
    return null;
  },
});
