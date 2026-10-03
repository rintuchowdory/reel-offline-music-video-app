import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel.d.ts";

async function requireAdmin(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not signed in" });
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user || user.role !== "admin") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Admins only" });
  }
}

const MAX_QUEUE_VIDEOS = 300;
const MAX_SEARCH_RESULTS = 30;

async function toItem(ctx: QueryCtx, video: Doc<"videos">) {
  return {
    _id: video._id,
    title: video.title,
    artist: video.artist,
    kind: video.kind ?? "video",
    videoUrl: await ctx.storage.getUrl(video.videoStorageId),
    thumbnailUrl: video.thumbnailStorageId
      ? await ctx.storage.getUrl(video.thumbnailStorageId)
      : null,
  };
}

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    sort: v.optional(v.union(v.literal("newest"), v.literal("artist"))),
  },
  handler: async (ctx, args) => {
    const results =
      args.sort === "artist"
        ? await ctx.db.query("videos").withIndex("by_artist").order("asc").paginate(args.paginationOpts)
        : await ctx.db.query("videos").order("desc").paginate(args.paginationOpts);
    return { ...results, page: await Promise.all(results.page.map((video) => toItem(ctx, video))) };
  },
});

// Matches on title or artist, merged without duplicates
export const search = query({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const text = args.text.trim();
    if (!text) return [];
    const [byTitle, byArtist] = await Promise.all([
      ctx.db
        .query("videos")
        .withSearchIndex("search_title", (q) => q.search("title", text))
        .take(MAX_SEARCH_RESULTS),
      ctx.db
        .query("videos")
        .withSearchIndex("search_artist", (q) => q.search("artist", text))
        .take(MAX_SEARCH_RESULTS),
    ]);
    const unique = new Map<string, Doc<"videos">>();
    for (const video of [...byTitle, ...byArtist]) unique.set(video._id, video);
    return await Promise.all([...unique.values()].map((video) => toItem(ctx, video)));
  },
});

// Whole catalog (capped) for "Play all"; fetched on demand, not subscribed
export const listForQueue = query({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").order("desc").take(MAX_QUEUE_VIDEOS);
    return await Promise.all(
      videos.map(async (video) => ({
        _id: video._id,
        title: video.title,
        artist: video.artist,
        kind: video.kind ?? "video",
        thumbnailUrl: video.thumbnailStorageId
          ? await ctx.storage.getUrl(video.thumbnailStorageId)
          : null,
      })),
    );
  },
});

export const get = query({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    const video: Doc<"videos"> | null = await ctx.db.get("videos", args.id);
    if (!video) return null;
    return {
      _id: video._id,
      title: video.title,
      artist: video.artist,
      kind: video.kind ?? "video",
      videoUrl: await ctx.storage.getUrl(video.videoStorageId),
      thumbnailUrl: video.thumbnailStorageId
        ? await ctx.storage.getUrl(video.thumbnailStorageId)
        : null,
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    videoStorageId: v.id("_storage"),
    thumbnailStorageId: v.optional(v.id("_storage")),
    kind: v.optional(v.union(v.literal("video"), v.literal("audio"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("videos", {
      ...args,
      kind: args.kind ?? "video",
    });
  },
});

export const remove = mutation({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const video = await ctx.db.get("videos", args.id);
    if (!video) throw new ConvexError({ code: "NOT_FOUND", message: "Video not found" });
    await ctx.storage.delete(video.videoStorageId);
    if (video.thumbnailStorageId) await ctx.storage.delete(video.thumbnailStorageId);
    await ctx.db.delete("videos", args.id);
    return null;
  },
});
