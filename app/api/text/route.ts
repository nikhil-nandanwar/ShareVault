import { createContentRecord } from "@/utils/createContent";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text content is required and must be a string" },
        { status: 400 },
      );
    }

    const trimmedText = text.trim();

    if (trimmedText.length === 0) {
      return NextResponse.json(
        { error: "Text cannot be empty" },
        { status: 400 },
      );
    }

    if (trimmedText.length < 3) {
      return NextResponse.json(
        { error: "Text must be at least 3 characters long" },
        { status: 400 },
      );
    }

    const code = await createContentRecord(trimmedText);

    return NextResponse.json(
      {
        message: "Text uploaded successfully",
        code,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: message || "Failed to process text" },
      { status: 500 },
    );
  }
}
