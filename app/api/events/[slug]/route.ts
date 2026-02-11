import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const SLUG_REGEX = /^[a-z0-9-]+$/;

function isValidSlug(value: string): boolean {
  return value.length > 0 && SLUG_REGEX.test(value);
}

type RouteContext = { params: Promise<{ slug: string }> };

async function extractSlug(
  req: NextRequest,
  context: RouteContext
): Promise<string | null> {
  const { slug } = await context.params;
  if (typeof slug === "string" && slug.length > 0) {
    return slug;
  }

  // Fallback when params are not populated (e.g., edge cases in routing)
  const pathname = req.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment && lastSegment !== "events" ? lastSegment : null;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const rawSlug = await extractSlug(req, context);
    if (typeof rawSlug !== "string") {
      return NextResponse.json(
        { message: "Missing slug parameter" },
        { status: 400 }
      );
    }

    const slug = rawSlug.trim().toLowerCase();
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { message: "Invalid slug parameter" },
        { status: 400 }
      );
    }

    await connectDB();

    const event = await Event.findOne({ slug });
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }


    return NextResponse.json({ message: "Event fetched", event }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      { message: "Failed to fetch event", error: message },
      { status: 500 }
    );
  }
}
