import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { variables } from "@/lib/variables";
import { Content } from "@/models/dataContent.model";
import { connectToDatabase } from "@/utils/db";

export const maxDuration = 30;

type CompleteRequestBody = {
  code?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompleteRequestBody;
    const code = body.code?.trim();

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "A valid 6-digit code is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const contentRecord = await Content.findOne({ code }).select("_id").lean();

    if (!contentRecord) {
      return NextResponse.json(
        { error: "Upload session not found or expired" },
        { status: 404 },
      );
    }

    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: variables.BUCKET_NAME,
        Prefix: `data/${code}/`,
      }),
    );

    const uploadedKeys =
      listResponse.Contents?.filter(
        (item) => item.Key && !item.Key.endsWith("/"),
      ).map((item) => item.Key as string) ?? [];

    if (uploadedKeys.length === 0) {
      return NextResponse.json(
        { error: "No files were uploaded. Please try again." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: `Successfully uploaded ${uploadedKeys.length} file(s)!`,
        files: uploadedKeys,
        code,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: message || "Failed to finalize upload" },
      { status: 500 },
    );
  }
}
