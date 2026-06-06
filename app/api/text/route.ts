import { generateFolderName } from "@/utils/folderName";
import { uploadToDb } from "@/utils/uploadToDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    // Validation
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text content is required and must be a string" },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();

    if (trimmedText.length === 0) {
      return NextResponse.json(
        { error: "Text cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedText.length < 3) {
      return NextResponse.json(
        { error: "Text must be at least 3 characters long" },
        { status: 400 }
      );
    }

    const code = await generateFolderName();

    if (!code) {
      throw new Error("Failed to generate folder name");
    }

    const response = await uploadToDb(code, trimmedText);

    if (response !== code) {
      throw new Error("Failed to save text to the database");
    }

    return NextResponse.json(
      {
        message: "Text uploaded successfully",
        code: response,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error processing text:", error);
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: message || "Failed to process text" },
      { status: 500 }
    );
  }
}
