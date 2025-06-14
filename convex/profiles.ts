import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return null;

    let profileImageUrl = null;
    if (profile.profileImage) {
      profileImageUrl = await ctx.storage.getUrl(profile.profileImage);
    }

    return {
      ...profile,
      profileImageUrl,
    };
  },
});

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) return null;

    const user = await ctx.db.get(args.userId);
    
    let profileImageUrl = null;
    if (profile.profileImage) {
      profileImageUrl = await ctx.storage.getUrl(profile.profileImage);
    }

    return { ...profile, user, profileImageUrl };
  },
});

export const createOrUpdateProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    headline: v.string(),
    location: v.optional(v.string()),
    about: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, args);
      return existingProfile._id;
    } else {
      return await ctx.db.insert("profiles", {
        userId,
        ...args,
      });
    }
  },
});

export const addExperience = mutation({
  args: {
    title: v.string(),
    company: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const currentExperience = profile.experience || [];
    const newExperience = [...currentExperience, args];

    await ctx.db.patch(profile._id, {
      experience: newExperience,
    });
  },
});

export const addSkill = mutation({
  args: { skill: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const currentSkills = profile.skills || [];
    if (currentSkills.includes(args.skill)) return;

    const newSkills = [...currentSkills, args.skill];

    await ctx.db.patch(profile._id, {
      skills: newSkills,
    });
  },
});

export const updateProfileImage = mutation({
  args: { imageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      profileImage: args.imageId,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
