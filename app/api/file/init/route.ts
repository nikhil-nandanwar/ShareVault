import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import {
  sanitizeFileName,
  validateFileMetas,
  type FileMeta,
} from "@/lib/fileValidation";
import { variables } from "@/lib/variables";
import { createContentRecord } from "@/utils/createContent";

export const maxDuration = 60;

type InitRequestBody = {
  files?: FileMeta[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InitRequestBody;
    const files = body.files ?? [];

    const validationError = validateFileMetas(files);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const code = await createContentRecord("");

    const uploads = await Promise.all(
      files.map(async (file) => {
        const fileName = sanitizeFileName(file.name);
        const key = `data/${code}/${fileName}`;

        const command = new PutObjectCommand({
          Bucket: variables.BUCKET_NAME,
          Key: key,
          ContentType: file.type,
        });

        const presignedUrl = await getSignedUrl(s3, command, {
          expiresIn: 3600,
        });

        return {
          fileName,
          key,
          presignedUrl,
        };
      }),
    );

    return NextResponse.json(
      {
        code,
        uploads,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: message || "Failed to prepare file upload" },
      { status: 500 },
    );
  }
}
