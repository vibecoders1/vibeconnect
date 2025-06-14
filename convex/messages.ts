import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get all messages where user is sender or recipient
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_participants", (q) => 
        q.eq("senderId", userId).eq("recipientId", userId)
      )
      .collect();

    const sentMessages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", userId))
      .collect();

    const receivedMessages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
      .collect();

    const allMessages = [...sentMessages, ...receivedMessages];

    // Group messages by conversation partner
    const conversationMap = new Map();
    
    for (const message of allMessages) {
      const partnerId = message.senderId === userId ? message.recipientId : message.senderId;
      
      if (!conversationMap.has(partnerId) || 
          message._creationTime > conversationMap.get(partnerId)._creationTime) {
        conversationMap.set(partnerId, message);
      }
    }

    // Get partner profiles for each conversation
    const conversations = await Promise.all(
      Array.from(conversationMap.entries()).map(async ([partnerId, lastMessage]) => {
        const partner = await ctx.db.get(partnerId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", partnerId))
          .unique();

        let profileImageUrl = null;
        if (profile?.profileImage) {
          profileImageUrl = await ctx.storage.getUrl(profile.profileImage);
        }

        // Count unread messages
        const unreadCount = await ctx.db
          .query("messages")
          .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
          .filter((q) => q.and(
            q.eq(q.field("senderId"), partnerId),
            q.eq(q.field("isRead"), false)
          ))
          .collect();

        return {
          partnerId,
          partner,
          profile: profile ? { ...profile, profileImageUrl } : null,
          lastMessage,
          unreadCount: unreadCount.length,
        };
      })
    );

    // Sort by last message time
    return conversations.sort((a, b) => b.lastMessage._creationTime - a.lastMessage._creationTime);
  },
});

export const getMessages = query({
  args: { partnerId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.or(
        q.and(
          q.eq(q.field("senderId"), userId),
          q.eq(q.field("recipientId"), args.partnerId)
        ),
        q.and(
          q.eq(q.field("senderId"), args.partnerId),
          q.eq(q.field("recipientId"), userId)
        )
      ))
      .order("asc")
      .collect();

    return messages;
  },
});

export const sendMessage = mutation({
  args: {
    recipientId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (userId === args.recipientId) {
      throw new Error("Cannot send message to yourself");
    }

    // Check if users are connected
    const connection1 = await ctx.db
      .query("connections")
      .withIndex("by_users", (q) => q.eq("requesterId", userId).eq("recipientId", args.recipientId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .unique();

    const connection2 = await ctx.db
      .query("connections")
      .withIndex("by_users", (q) => q.eq("requesterId", args.recipientId).eq("recipientId", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .unique();

    if (!connection1 && !connection2) {
      throw new Error("You can only message your connections");
    }

    return await ctx.db.insert("messages", {
      senderId: userId,
      recipientId: args.recipientId,
      content: args.content.trim(),
      isRead: false,
    });
  },
});

export const markAsRead = mutation({
  args: { partnerId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
      .filter((q) => q.and(
        q.eq(q.field("senderId"), args.partnerId),
        q.eq(q.field("isRead"), false)
      ))
      .collect();

    await Promise.all(
      unreadMessages.map(message => 
        ctx.db.patch(message._id, { isRead: true })
      )
    );
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadMessages.length;
  },
});
