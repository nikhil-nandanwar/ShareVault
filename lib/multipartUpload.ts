import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { logger } from "@/lib/logger";
import { s3 } from "@/lib/s3";
import { variables } from "@/lib/variables";

const PART_SIZE = 10 * 1024 * 1024;
const PART_CONCURRENCY = 3;

type CompletedPart = { ETag: string; PartNumber: number };

async function uploadParts(
  objectKey: string,
  uploadId: string,
  file: File,
): Promise<CompletedPart[]> {
  const partCount = Math.ceil(file.size / PART_SIZE);
  const completedParts: CompletedPart[] = new Array(partCount);
  let nextPartNumber = 1;

  async function worker() {
    while (nextPartNumber <= partCount) {
      const partNumber = nextPartNumber++;
      const start = (partNumber - 1) * PART_SIZE;
      const end = Math.min(start + PART_SIZE, file.size);
      const body = new Uint8Array(await file.slice(start, end).arrayBuffer());

      const uploadResponse = await s3.send(
        new UploadPartCommand({
          Bucket: variables.BUCKET_NAME,
          Key: objectKey,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: body,
          ContentLength: body.byteLength,
        }),
      );

      if (!uploadResponse.ETag) {
        throw new Error(
          `Multipart upload did not return an ETag for part ${partNumber} of ${objectKey}`,
        );
      }

      completedParts[partNumber - 1] = {
        ETag: uploadResponse.ETag,
        PartNumber: partNumber,
      };
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(PART_CONCURRENCY, partCount) }, () =>
      worker(),
    ),
  );

  return completedParts;
}

export async function uploadFileMultipart(
  objectKey: string,
  file: File,
): Promise<string> {
  // A single PUT avoids the create/complete round trips for small files.
  if (file.size <= PART_SIZE) {
    const body = new Uint8Array(await file.arrayBuffer());
    await s3.send(
      new PutObjectCommand({
        Bucket: variables.BUCKET_NAME,
        Key: objectKey,
        Body: body,
        ContentLength: body.byteLength,
        ContentType: file.type || "application/octet-stream",
      }),
    );
    return objectKey;
  }

  const createResponse = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: variables.BUCKET_NAME,
      Key: objectKey,
      ContentType: file.type || "application/octet-stream",
    }),
  );
  const uploadId = createResponse.UploadId;

  if (!uploadId) {
    throw new Error(
      `Multipart upload did not return an upload ID for ${objectKey}`,
    );
  }

  try {
    const completedParts = await uploadParts(objectKey, uploadId, file);

    await s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: variables.BUCKET_NAME,
        Key: objectKey,
        UploadId: uploadId,
        MultipartUpload: { Parts: completedParts },
      }),
    );

    return objectKey;
  } catch (error) {
    try {
      await s3.send(
        new AbortMultipartUploadCommand({
          Bucket: variables.BUCKET_NAME,
          Key: objectKey,
          UploadId: uploadId,
        }),
      );
    } catch (abortError) {
      logger.warn("Failed to abort multipart upload", {
        objectKey,
        uploadId,
        error:
          abortError instanceof Error ? abortError.message : String(abortError),
      });
    }

    throw error;
  }
}
