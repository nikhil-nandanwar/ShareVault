import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";
import { variables } from "@/lib/variables";
import { connectToDatabase } from "@/utils/db";
import { Content } from "@/models/dataContent.model";

export const maxDuration = 60;

const PRESIGNED_URL_EXPIRY = 3600;

async function buildFileEntry(
  bucketName: string,
  fileKey: string,
  sizeInBytes: number | undefined,
) {
  const fileName = fileKey.substring(fileKey.lastIndexOf("/") + 1);

  const [presignedUrl, directDownloadLink] = await Promise.all([
    getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      }),
      { expiresIn: PRESIGNED_URL_EXPIRY },
    ),
    getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
      }),
      { expiresIn: PRESIGNED_URL_EXPIRY },
    ),
  ]);

  return {
    fileName,
    sizeInBytes: sizeInBytes ?? 0,
    presignedUrl,
    directDownloadLink,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Code parameter is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const contentRecord = await Content.findOne({ code })
      .select("data")
      .lean();

    if (!contentRecord) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    if (contentRecord.data) {
      return NextResponse.json(
        {
          data: contentRecord.data,
          source: "database",
        },
        {
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }

    const bucketName = variables.BUCKET_NAME;
    if (!bucketName) {
      throw new Error("Storage bucket is not configured");
    }

    const prefix = `data/${code}/`;

    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      }),
    );

    const objects =
      listResponse.Contents?.filter(
        (item) => item.Key && !item.Key.endsWith("/"),
      ) ?? [];

    if (objects.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const resolvedFiles = await Promise.all(
      objects.map((item) =>
        buildFileEntry(bucketName, item.Key!, item.Size),
      ),
    );

    return NextResponse.json(
      {
        files: resolvedFiles,
        source: "r2",
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: message || "Failed to process request" },
      { status: 500 },
    );
  }
}
