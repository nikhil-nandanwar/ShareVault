export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    console.error("Unhandled error:", error);
    return Response.json(
      {
        error: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  console.error("Unknown error:", error);
  return Response.json(
    {
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}
