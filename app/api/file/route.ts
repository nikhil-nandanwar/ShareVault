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
import { ValidationError, handleApiError } from "@/lib/apiErrors";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  try {
    logger.apiRequest("POST", "/api/file", { ip });

    // Rate limiting based on IP
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      const headers = getRateLimitHeaders(ip);
      logger.warn("Rate limit exceeded", { ip, resetTime: rateLimit.resetTime });
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      throw new ValidationError("No files provided. Please select at least one file.");
    }

    const validationError = validateFileMetas(
      files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    );

    if (validationError) {
      throw new ValidationError(validationError);
    }

    const code = await createContentRecord("");
    logger.info("Generated retrieval code", { code, fileCount: files.length });

    const uploadedKeys = await Promise.all(
      files.map(async (file) => {
        const fileName = sanitizeFileName(file.name);
        const objectKey = `data/${code}/${fileName}`;
        
        logger.fileUploadStart(fileName, file.size);

        const command = new PutObjectCommand({
          Bucket: variables.BUCKET_NAME,
          Key: objectKey,
          Body: Readable.fromWeb(
            file.stream() as Parameters<typeof Readable.fromWeb>[0],
          ),
          ContentType: file.type,
          ContentLength: file.size,
        });

        const uploadStart = Date.now();
        await s3.send(command);
        const uploadDuration = Date.now() - uploadStart;
        
        logger.fileUploadComplete(fileName, uploadDuration);
        return objectKey;
      }),
    );

    const duration = Date.now() - startTime;
    const headers = getRateLimitHeaders(ip);
    
    logger.apiResponse("POST", "/api/file", 200, duration);
    
    return NextResponse.json(
      {
        message: `Successfully uploaded ${uploadedKeys.length} file(s)!`,
        files: uploadedKeys,
        code,
      },
      { status: 200, headers },
    );
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    logger.apiError("POST", "/api/file", error as Error, { ip, duration });
    return handleApiError(error);
  }
}
