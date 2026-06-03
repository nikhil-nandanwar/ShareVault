import { s3 } from "@/lib/s3";
import { variables } from "@/lib/variables";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const fileKey = request.nextUrl.searchParams.get("fileKey");

    if (!fileKey) {
      return NextResponse.json({ error: "Missing fileKey parameter." }, { status: 400 });
    }

    if (!variables.BUCKET_NAME) {
      return NextResponse.json({ error: "Missing bucket configuration." }, { status: 500 });
    }

    const command = new GetObjectCommand({
      Bucket: variables.BUCKET_NAME,
      Key: fileKey,
    });

    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 15 });

    return NextResponse.json({ downloadUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error downloading file:", error);
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json({ error: message || "Failed to download file." }, { status: 500 });
  }
}