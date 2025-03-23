import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  posts: defineTable({
    author: v.id("users"),
    createdDate: v.string(),
    bean: v.string(),
    roastLevel: v.string(),
    coffeeIn: v.string(),
    ratio: v.string(),
    beanProfile: v.optional(v.id("bean_profiles")),
    beverageWeight: v.string(),
    brewTemperature: v.string(),
    filterPaper: v.string(),
    grinder: v.string(),
    grindSetting: v.string(),
    bloomTime: v.string(),
    totalDrawdownTime: v.optional(v.string()),
    brewingWater: v.optional(v.string()),
    recipeSteps: v.optional(
      v.array(
        v.object({
          timestamp: v.string(),
          action: v.string(),
          value: v.number(),
        }),
      ),
    ),
    methodName: v.optional(v.string()),
    brewer: v.optional(v.string()),
    otherTools: v.optional(v.string()),
    flavor: v.optional(v.string()),
    tds: v.optional(v.number()),
    ey: v.optional(v.number()),
  }).index("by_author", ["author"]),
  post_images: defineTable({
    postId: v.id("posts"),
    storageId: v.id("_storage"),
    contentType: v.string(),
  }).index("by_post", ["postId"]),
  gears: defineTable({
    name: v.string(),
    type: v.string(),
    details: v.optional(v.string()),
    owner: v.id("users"),
  }).index("by_owner", ["owner"]),
  bean_profiles: defineTable({
    origin: v.string(),
    producer: v.string(),
    farm: v.string(),
    roaster: v.string(),
    process: v.string(),
    variety: v.string(),
    elevation: v.string(),
    owner: v.id("users"),
    description: v.optional(v.string()),
    finished: v.boolean(),
  }).index("by_owner", ["owner"]),
});
