import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    headline: v.string(),
    location: v.optional(v.string()),
    about: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
    experience: v.optional(v.array(v.object({
      title: v.string(),
      company: v.string(),
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
      description: v.optional(v.string()),
    }))),
    skills: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),

  connections: defineTable({
    requesterId: v.id("users"),
    recipientId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
  })
    .index("by_requester", ["requesterId"])
    .index("by_recipient", ["recipientId"])
    .index("by_users", ["requesterId", "recipientId"]),

  posts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video"), v.literal("article")),
    mediaId: v.optional(v.id("_storage")),
    title: v.optional(v.string()),
    likesCount: v.number(),
    commentsCount: v.number(),
  }),

  likes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  }).index("by_user_post", ["userId", "postId"]),

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
  }).index("by_post", ["postId"]),

  messages: defineTable({
    senderId: v.id("users"),
    recipientId: v.id("users"),
    content: v.string(),
    isRead: v.boolean(),
  })
    .index("by_sender", ["senderId"])
    .index("by_recipient", ["recipientId"])
    .index("by_participants", ["senderId", "recipientId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
