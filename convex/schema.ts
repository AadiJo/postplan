import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    slug: v.string(),
    displayName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),
  plans: defineTable({
    publicId: v.string(),
    projectSlug: v.string(),
    localName: v.string(),
    title: v.optional(v.string()),
    date: v.string(),
    html: v.string(),
    sourceFilename: v.string(),
    contentHash: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_publicId", ["publicId"])
    .index("by_projectSlug", ["projectSlug"])
    .index("by_project_source", ["projectSlug", "sourceFilename"]),
});
