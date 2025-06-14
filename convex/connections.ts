import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendConnectionRequest = mutation({
  args: { recipientId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (userId === args.recipientId) {
      throw new Error("Cannot connect to yourself");
    }

    const existingConnection = await ctx.db
      .query("connections")
      .withIndex("by_users", (q) => q.eq("requesterId", userId).eq("recipientId", args.recipientId))
      .unique();

    const reverseConnection = await ctx.db
      .query("connections")
      .withIndex("by_users", (q) => q.eq("requesterId", args.recipientId).eq("recipientId", userId))
      .unique();

    if (existingConnection || reverseConnection) {
      throw new Error("Connection already exists");
    }

    return await ctx.db.insert("connections", {
      requesterId: userId,
      recipientId: args.recipientId,
      status: "pending",
    });
  },
});

export const respondToConnection = mutation({
  args: {
    connectionId: v.id("connections"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) throw new Error("Connection not found");

    if (connection.recipientId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.connectionId, {
      status: args.accept ? "accepted" : "rejected",
    });
  },
});

export const getConnectionRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("connections")
      .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requesterId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", request.requesterId))
          .unique();

        let profileImageUrl = null;
        if (profile?.profileImage) {
          profileImageUrl = await ctx.storage.getUrl(profile.profileImage);
        }

        return {
          ...request,
          requester,
          profile: profile ? { ...profile, profileImageUrl } : null,
        };
      })
    );

    return requestsWithProfiles;
  },
});

export const getConnections = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    const targetUserId = args.userId || currentUserId;
    
    if (!targetUserId) return [];

    const sentConnections = await ctx.db
      .query("connections")
      .withIndex("by_requester", (q) => q.eq("requesterId", targetUserId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const receivedConnections = await ctx.db
      .query("connections")
      .withIndex("by_recipient", (q) => q.eq("recipientId", targetUserId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const allConnections = [...sentConnections, ...receivedConnections];
    
    const connectionsWithProfiles = await Promise.all(
      allConnections.map(async (connection) => {
        const otherUserId = connection.requesterId === targetUserId 
          ? connection.recipientId 
          : connection.requesterId;
        
        const user = await ctx.db.get(otherUserId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", otherUserId))
          .unique();

        let profileImageUrl = null;
        if (profile?.profileImage) {
          profileImageUrl = await ctx.storage.getUrl(profile.profileImage);
        }

        return {
          user,
          profile: profile ? { ...profile, profileImageUrl } : null,
        };
      })
    );

    return connectionsWithProfiles;
  },
});

export const getConnectionStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return "none";

    if (currentUserId === args.userId) return "self";

    const sentConnection = await ctx.db
      .query("connections")
      .withIndex("by_users", (q) => q.eq("requesterId", currentUserId).eq("recipientId", args.userId))
      .unique();

    const receivedConnection = await ctx.db
      .query("connections")
      .withIndex("by_users", (q) => q.eq("requesterId", args.userId).eq("recipientId", currentUserId))
      .unique();

    if (sentConnection) {
      return sentConnection.status === "accepted" ? "connected" : "pending_sent";
    }

    if (receivedConnection) {
      return receivedConnection.status === "accepted" ? "connected" : "pending_received";
    }

    return "none";
  },
});
