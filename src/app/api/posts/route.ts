import { NextResponse } from "next/server";
import { agent } from "~/lib/api";
import { headers } from "next/headers";

export const runtime = "edge"; // Use edge runtime for better performance

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const feed = searchParams.get("feed");
    const cursor = searchParams.get("cursor");

    // Validate required parameters
    if (!feed) {
      return NextResponse.json(
        { error: "Feed parameter is required" },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const { data } = await agent.app.bsky.feed.getFeed(
      {
        feed: feed as string,
        limit: 30,
        cursor: cursor || undefined,
      },
      {
        headers: {
          "Accept-Language": "en-US",
          Authorization: authHeader,
        },
      }
    );

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
