import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";
import { variables } from "@/lib/variables";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");

    if (!folder) {
      return NextResponse.json(
        { error: "Folder parameter is required" },
        { status: 400 },
      );
    }

    // Ensure the prefix targets a simulated folder structure correctly
    const prefix = folder.endsWith("/") ? folder : `${folder}/`;
    const bucketName = variables.BUCKET_NAME;

    // 1. Fetch the list of objects matching the folder prefix from R2
    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      }),
    );

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return NextResponse.json({ files: [] }); // Return empty array if folder is empty
    }

    // 2. Map through objects to extract names and generate URLs
    const fileListPromises = listResponse.Contents.map(async (item) => {
      const fileKey = item.Key!;

      // Skip directory placeholder structures if any exist
      if (fileKey.endsWith("/")) return null;

      // Extract just the file name out of the full key path (e.g. "folder/sub/doc.pdf" -> "doc.pdf")
      const fileName = fileKey.substring(fileKey.lastIndexOf("/") + 1);

      // Generate a Secure Presigned Download URL (Expires in 1 Hour / 3600 seconds)
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });

      const presignedUrl = await getSignedUrl(s3, getObjectCommand, {
        expiresIn: 3600,
      });

      // Generate Direct Download Link (Requires Bucket Public Access to be turned on)
      const downloadCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        // Optional: This header forces the browser to download the file instead of opening it inline
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
      });
      const directDownloadLink = await getSignedUrl(s3, downloadCommand, {
        expiresIn: 3600,
      });

      return {
        fileName: fileName,
        sizeInBytes: item.Size,
        lastModified: item.LastModified,
        presignedUrl: presignedUrl,
        directDownloadLink: directDownloadLink,
      };
    });

    // Filter out any null values from directory placeholders
    const resolvedFiles = (await Promise.all(fileListPromises)).filter(Boolean);

    return NextResponse.json({ files: resolvedFiles });
  } catch (error: unknown) {
    console.error("Error listing files:", error);
        const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: message || "Failed to list files" },
      { status: 500 },
    );
  }
}
