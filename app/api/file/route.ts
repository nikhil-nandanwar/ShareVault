import { sanitizeFileName, validateFileMetas } from "@/lib/fileValidation";
import { NextRequest, NextResponse } from "next/server";
import { createContentRecord } from "@/utils/createContent";
import { ValidationError, handleApiError } from "@/lib/apiErrors";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { uploadFileMultipart } from "@/lib/multipartUpload";

export const maxDuration = 120;
const FILE_UPLOAD_CONCURRENCY = 2;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    logger.apiRequest("POST", "/api/file", { ip });

    // Rate limiting based on IP
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      const headers = getRateLimitHeaders(ip);
      logger.warn("Rate limit exceeded", {
        ip,
        resetTime: rateLimit.resetTime,
      });
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers },
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      throw new ValidationError(
        "No files provided. Please select at least one file.",
      );
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

    const uploadedKeys = await mapWithConcurrency(
      files,
      FILE_UPLOAD_CONCURRENCY,
      async (file) => {
        const fileName = sanitizeFileName(file.name);
        const objectKey = `data/${code}/${fileName}`;

        logger.fileUploadStart(fileName, file.size);

        const uploadStart = Date.now();
        await uploadFileMultipart(objectKey, file);
        const uploadDuration = Date.now() - uploadStart;

        logger.fileUploadComplete(fileName, uploadDuration);
        return objectKey;
      },
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
