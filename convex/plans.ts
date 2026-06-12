import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listProjectsWithPlans = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const plans = await ctx.db.query("plans").collect();
    const plansByProject = new Map<string, typeof plans>();

    for (const plan of plans) {
      const existing = plansByProject.get(plan.projectSlug) ?? [];
      existing.push(plan);
      plansByProject.set(plan.projectSlug, existing);
    }

    return projects
      .map((project) => {
        const projectPlans = (plansByProject.get(project.slug) ?? [])
          .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt)
          .map((plan) => ({
            publicId: plan.publicId,
            projectSlug: plan.projectSlug,
            localName: plan.localName,
            title: plan.title,
            date: plan.date,
            sourceFilename: plan.sourceFilename,
            updatedAt: plan.updatedAt,
          }));

        return {
          slug: project.slug,
          displayName: project.displayName,
          updatedAt: project.updatedAt,
          plans: projectPlans,
        };
      })
      .filter((project) => project.plans.length > 0)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("plans")
      .withIndex("by_publicId", (q) => q.eq("publicId", args.publicId))
      .unique();
  },
});

export const upsertFromPublish = mutation({
  args: {
    projectSlug: v.string(),
    sourceFilename: v.string(),
    localName: v.string(),
    title: v.optional(v.string()),
    date: v.string(),
    html: v.string(),
    contentHash: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.projectSlug))
      .unique();

    if (existingProject) {
      await ctx.db.patch(existingProject._id, { updatedAt: now });
    } else {
      await ctx.db.insert("projects", {
        slug: args.projectSlug,
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingPlan = await ctx.db
      .query("plans")
      .withIndex("by_project_source", (q) =>
        q.eq("projectSlug", args.projectSlug).eq("sourceFilename", args.sourceFilename),
      )
      .unique();

    if (existingPlan) {
      if (existingPlan.contentHash !== args.contentHash) {
        await ctx.db.patch(existingPlan._id, {
          localName: args.localName,
          title: args.title,
          date: args.date,
          html: args.html,
          contentHash: args.contentHash,
          updatedAt: now,
        });
      }

      return {
        publicId: existingPlan.publicId,
        updated: existingPlan.contentHash !== args.contentHash,
      };
    }

    const planId = await ctx.db.insert("plans", {
      publicId: "pending",
      projectSlug: args.projectSlug,
      localName: args.localName,
      title: args.title,
      date: args.date,
      html: args.html,
      sourceFilename: args.sourceFilename,
      contentHash: args.contentHash,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(planId, { publicId: planId });

    return {
      publicId: planId,
      updated: true,
    };
  },
});
