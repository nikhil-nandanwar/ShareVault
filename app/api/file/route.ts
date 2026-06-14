import { s3 } from "@/lib/s3";
import { variables } from "@/lib/variables";
import {
  sanitizeFileName,
  validateFileMetas,
} from "@/lib/fileValidation";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "node:stream";
import { createContentRecord } from "@/utils/createContent";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    const validationError = validateFileMetas(
      files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    );

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const code = await createContentRecord("");

    const uploadedKeys = await Promise.all(
      files.map(async (file) => {
        const fileName = sanitizeFileName(file.name);
        const objectKey = `data/${code}/${fileName}`;

        const command = new PutObjectCommand({
          Bucket: variables.BUCKET_NAME,
          Key: objectKey,
          Body: Readable.fromWeb(
            file.stream() as Parameters<typeof Readable.fromWeb>[0],
          ),
          ContentType: file.type,
          ContentLength: file.size,
        });

        await s3.send(command);
        return objectKey;
      }),
    );

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
      { error: message || "Failed to upload files" },
      { status: 500 },
    );
  }
}
