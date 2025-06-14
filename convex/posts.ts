import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getFeed = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .order("desc")
      .take(50);

    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", post.authorId))
          .unique();

        let profileImageUrl = null;
        if (profile?.profileImage) {
          profileImageUrl = await ctx.storage.getUrl(profile.profileImage);
        }

        const userId = await getAuthUserId(ctx);
        let isLiked = false;
        if (userId) {
          const like = await ctx.db
            .query("likes")
            .withIndex("by_user_post", (q) => q.eq("userId", userId).eq("postId", post._id))
            .unique();
          isLiked = !!like;
        }

        let mediaUrl = null;
        if (post.mediaId) {
          mediaUrl = await ctx.storage.getUrl(post.mediaId);
        }

        return {
          ...post,
          author,
          profile: profile ? { ...profile, profileImageUrl } : null,
          isLiked,
          mediaUrl,
        };
      })
    );

    return postsWithAuthors;
  },
});

export const createPost = mutation({
  args: {
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video"), v.literal("article")),
    mediaId: v.optional(v.id("_storage")),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("posts", {
      authorId: userId,
      content: args.content,
      type: args.type,
      mediaId: args.mediaId,
      title: args.title,
      likesCount: 0,
      commentsCount: 0,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_post", (q) => q.eq("userId", userId).eq("postId", args.postId))
      .unique();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.postId, {
        likesCount: Math.max(0, post.likesCount - 1),
      });
    } else {
      await ctx.db.insert("likes", {
        postId: args.postId,
        userId,
      });
      await ctx.db.patch(args.postId, {
        likesCount: post.likesCount + 1,
      });
    }
  },
});

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: userId,
      content: args.content,
    });

    await ctx.db.patch(args.postId, {
      commentsCount: post.commentsCount + 1,
    });
  },
});

export const getComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", comment.authorId))
          .unique();

        let profileImageUrl = null;
        if (profile?.profileImage) {
          profileImageUrl = await ctx.storage.getUrl(profile.profileImage);
        }

        return {
          ...comment,
          author,
          profile: profile ? { ...profile, profileImageUrl } : null,
        };
      })
    );

    return commentsWithAuthors;
  },
});
