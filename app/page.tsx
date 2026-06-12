import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { PlanBrowser, type ProjectGroup } from "./components/PlanBrowser";

export const dynamic = "force-dynamic";

async function getProjects(): Promise<ProjectGroup[]> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return [];
  }

  const client = new ConvexHttpClient(convexUrl);
  return client.query(api.plans.listProjectsWithPlans);
}

export default async function Home() {
  const projects = await getProjects();
  const planCount = projects.reduce((count, project) => count + project.plans.length, 0);

  return (
    <main className="page">
      <p className="brand">// postplan</p>
      <h1>published agent plans</h1>
      <p className="intro">
        Browse project groups, open a plan by its direct identifier, and keep the local source of
        truth in each repository&apos;s <code>.plans/</code> directory.
      </p>
      <p className="meta">
        {projects.length} projects / {planCount} plans / routes resolve as <code>/[id]</code>
      </p>
      <PlanBrowser projects={projects} />
    </main>
  );
}
