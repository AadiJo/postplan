import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return new Response("Convex is not configured.", { status: 500 });
  }

  const { id } = await context.params;
  const client = new ConvexHttpClient(convexUrl);
  const plan = await client.query(api.plans.getByPublicId, { publicId: id });

  if (!plan) {
    return new Response("Plan not found.", { status: 404 });
  }

  return new Response(plan.html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
