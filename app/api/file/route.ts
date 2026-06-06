import { generateFolderName } from "@/utils/folderName";
import { s3 } from "@/lib/s3";
import { variables } from "@/lib/variables";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { uploadToDb } from "@/utils/uploadToDB";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    // Validation
    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided. Please select at least one file." },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 files allowed per upload" },
        { status: 400 }
      );
    }

    // Validate each file
    for (const file of files) {
      if (file.size === 0) {
        return NextResponse.json(
          { error: `File "${file.name}" is empty` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds maximum size of 100MB`,
          },
          { status: 400 }
        );
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        console.log(`File type "${file.type}" not in allowed list`);
      }
    }

    const folderName = await generateFolderName();

    if (!folderName) {
      throw new Error("Failed to generate unique folder name");
    }

    const uploadedKeys = await Promise.all(
      files.map(async (file) => {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const objectKey = `${folderName}/${file.name}`;

        const command = new PutObjectCommand({
          Bucket: `${variables.BUCKET_NAME}`,
          Key: objectKey,
          Body: fileBuffer,
          ContentType: file.type,
        });

        await s3.send(command);
        return objectKey;
      })
    );

    const code = await uploadToDb(folderName);

    if (code !== folderName) {
      throw new Error("Failed to save upload information to database");
    }

    return NextResponse.json(
      {
        message: `Successfully uploaded ${uploadedKeys.length} file(s)!`,
        files: uploadedKeys,
        code: folderName,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("File upload error:", error);
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: message || "Failed to upload files" },
      { status: 500 }
    );
  }
}