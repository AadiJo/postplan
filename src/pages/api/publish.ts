import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { getConvexUrl } from "../../lib/plans";

type PublishPayload = {
  projectSlug?: string;
  sourceFilename?: string;
  localName?: string;
  title?: string;
  date?: string;
  html?: string;
  contentHash?: string;
};

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : "";
}

function requireString(value: unknown, name: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

export const POST: APIRoute = async ({ request, url }) => {
  const expectedToken = import.meta.env.POSTPLAN_PUBLISH_TOKEN;

  if (!expectedToken && import.meta.env.PROD) {
    return Response.json({ error: "POSTPLAN_PUBLISH_TOKEN is not configured" }, { status: 500 });
  }

  if (expectedToken && getBearerToken(request) !== expectedToken) {
    return Response.json({ error: "Invalid publish token" }, { status: 401 });
  }

  const convexUrl = getConvexUrl();

  if (!convexUrl) {
    return Response.json({ error: "NEXT_PUBLIC_CONVEX_URL is not configured" }, { status: 500 });
  }

  let payload: PublishPayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const projectSlug = requireString(payload.projectSlug, "projectSlug");
    const sourceFilename = requireString(payload.sourceFilename, "sourceFilename");
    const localName = requireString(payload.localName, "localName");
    const date = requireString(payload.date, "date");
    const html = requireString(payload.html, "html");
    const contentHash = requireString(payload.contentHash, "contentHash");

    const client = new ConvexHttpClient(convexUrl);
    const result = await client.mutation(api.plans.upsertFromPublish, {
      projectSlug,
      sourceFilename,
      localName,
      title: payload.title,
      date,
      html,
      contentHash,
    });

    return Response.json({
      ...result,
      url: `${url.origin}/${result.publicId}`,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Publish failed" },
      { status: 400 },
    );
  }
};
