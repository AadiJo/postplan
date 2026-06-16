import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export type PublishedPlan = {
  publicId: string;
  projectSlug: string;
  localName: string;
  title?: string;
  date: string;
  sourceFilename: string;
  updatedAt: number;
};

export type ProjectGroup = {
  slug: string;
  displayName?: string;
  updatedAt: number;
  plans: PublishedPlan[];
};

export function getConvexUrl() {
  return import.meta.env.NEXT_PUBLIC_CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL;
}

export async function getProjects(): Promise<ProjectGroup[]> {
  const convexUrl = getConvexUrl();

  if (!convexUrl) {
    return [];
  }

  const client = new ConvexHttpClient(convexUrl);
  return client.query(api.plans.listProjectsWithPlans);
}

export async function getPlanByPublicId(publicId: string) {
  const convexUrl = getConvexUrl();

  if (!convexUrl) {
    throw new Error("Convex is not configured.");
  }

  const client = new ConvexHttpClient(convexUrl);
  return client.query(api.plans.getByPublicId, { publicId });
}
