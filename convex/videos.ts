import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
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

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const results = await ctx.db.query("videos").order("desc").paginate(args.paginationOpts);
    return {
      ...results,
      page: await Promise.all(
        results.page.map(async (video) => ({
          _id: video._id,
          title: video.title,
          artist: video.artist,
          videoUrl: await ctx.storage.getUrl(video.videoStorageId),
          thumbnailUrl: video.thumbnailStorageId
            ? await ctx.storage.getUrl(video.thumbnailStorageId)
            : null,
        })),
      ),
    };
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
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("videos", args);
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
