import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";
import { variables } from "@/lib/variables";
import { connectToDatabase } from "@/utils/db";
import { Content } from "@/models/dataContent.model";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Code parameter is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Check if code exists in MongoDB
    const contentRecord = await Content.findOne({ code });

    if (!contentRecord) {
      return NextResponse.json(
        { error: "No data found" },
        { status: 404 }
      );
    }

    // If data field is present, return it
    if (contentRecord.data) {
      return NextResponse.json({ 
        data: contentRecord.data,
        source: "database"
      });
    }

    // If no data, check for folder in R2
    const prefix = `data/${code.endsWith("/") ? code : `${code}/`}`;
    const bucketName = variables.BUCKET_NAME;

    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      })
    );

    // Check if folder exists with at least 1 file
    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return NextResponse.json(
        { error: "No data found", list : listResponse },
        { status: 404 }
      );
    }


    // Map through objects to extract names and generate URLs
    const fileListPromises = listResponse.Contents.map(async (item) => {
      const fileKeyItem = `${item.Key}`;

      // Skip directory placeholder structures if any exist
      if (fileKeyItem.endsWith("/")) return null;

      // Extract just the file name out of the full key path (e.g. "folder/sub/doc.pdf" -> "doc.pdf")
      const fileName = fileKeyItem.substring(fileKeyItem.lastIndexOf("/") + 1);

      // Generate a Secure Presigned Download URL (Expires in 1 Hour / 3600 seconds)
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKeyItem,
      });

      const presignedUrl = await getSignedUrl(s3, getObjectCommand, {
        expiresIn: 3600,
      });

      // Generate Direct Download Link (Requires Bucket Public Access to be turned on)
      const downloadCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKeyItem,
        // Optional: This header forces the browser to download the file instead of opening it inline
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
      });
      const directDownloadLink = await getSignedUrl(s3, downloadCommand, {
        expiresIn: 3600,
      });

      return {
        fileName: fileName,
        sizeInBytes: item.Size,
        presignedUrl: presignedUrl,
        directDownloadLink: directDownloadLink,
      };
    });

    // Filter out any null values from directory placeholders
    const resolvedFiles = (await Promise.all(fileListPromises)).filter(Boolean);

    return NextResponse.json({ 
      files: resolvedFiles,
      source: "r2"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: message || "Failed to process request" },
      { status: 500 }
    );
  }
}
