import { NextResponse } from "next/server";
import { headers } from "next/headers";

// In-memory storage for visit count (resets on server restart)
// For production, use a database like Vercel KV, Redis, or PostgreSQL
let visitCount = 0;

export async function GET() {
  try {
    // Increment visit count
    visitCount++;

    return NextResponse.json({
      count: visitCount,
      message: "Visit counted successfully",
    });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return NextResponse.json({ error: "Failed to track visit" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";

    // Only count if it's a real browser (not a bot)
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

    if (!isBot) {
      visitCount++;
    }

    return NextResponse.json({
      count: visitCount,
      counted: !isBot,
    });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return NextResponse.json({ error: "Failed to track visit" }, { status: 500 });
  }
}
