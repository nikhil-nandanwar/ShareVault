import { generateFolderName } from "@/utils/folderName";
import { s3 } from "@/lib/s3";
import { variables } from "@/lib/variables";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const folderName = await generateFolderName();

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
      }),
    );

    return NextResponse.json(
      {
        message: "Successfully uploaded all files!",
        files: uploadedKeys,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("R2 Upload Error:", error);
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json({ error: message || "Upload failed" }, { status: 500 });
  }
}