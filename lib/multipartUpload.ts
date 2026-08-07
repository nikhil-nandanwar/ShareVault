import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { logger } from "@/lib/logger";
import { s3 } from "@/lib/s3";
import { variables } from "@/lib/variables";

const PART_SIZE = 10 * 1024 * 1024;

export async function uploadFileMultipart(
  objectKey: string,
  file: File,
): Promise<string> {
  const createResponse = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: variables.BUCKET_NAME,
      Key: objectKey,
      ContentType: file.type,
    }),
  );
  const uploadId = createResponse.UploadId;

  if (!uploadId) {
    throw new Error(
      `Multipart upload did not return an upload ID for ${objectKey}`,
    );
  }

  try {
    const completedParts: { ETag: string; PartNumber: number }[] = [];
    const partCount = Math.ceil(file.size / PART_SIZE);

    for (let partNumber = 1; partNumber <= partCount; partNumber++) {
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

      completedParts.push({
        ETag: uploadResponse.ETag,
        PartNumber: partNumber,
      });
    }

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
