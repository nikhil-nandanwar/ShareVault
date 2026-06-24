type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    const errorStr = error ? ` ${error.message}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case "info":
        console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        if (error && this.isDevelopment) {
          console.error(error.stack);
        }
        break;
      case "debug":
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log("error", message, context, error);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context);
  }

  // API-specific logging
  apiRequest(method: string, path: string, context?: Record<string, unknown>) {
    this.info(`${method} ${path}`, { ...context, type: "api_request" });
  }

  apiResponse(method: string, path: string, statusCode: number, duration: number) {
    this.info(`${method} ${path} - ${statusCode} (${duration}ms)`, {
      type: "api_response",
      statusCode,
      duration,
    });
  }

  apiError(method: string, path: string, error: Error, context?: Record<string, unknown>) {
    this.error(`${method} ${path} - Error`, error, { ...context, type: "api_error" });
  }

  // Database logging
  dbQuery(operation: string, collection: string, duration?: number) {
    this.debug(`DB ${operation} on ${collection}`, {
      type: "db_query",
      operation,
      collection,
      duration,
    });
  }

  dbError(operation: string, collection: string, error: Error) {
    this.error(`DB ${operation} on ${collection} - Error`, error, {
      type: "db_error",
      operation,
      collection,
    });
  }

  // File upload logging
  fileUploadStart(fileName: string, size: number) {
    this.info(`File upload started: ${fileName}`, {
      type: "file_upload_start",
      fileName,
      size,
    });
  }

  fileUploadComplete(fileName: string, duration: number) {
    this.info(`File upload completed: ${fileName}`, {
      type: "file_upload_complete",
      fileName,
      duration,
    });
  }

  fileUploadError(fileName: string, error: Error) {
    this.error(`File upload failed: ${fileName}`, error, {
      type: "file_upload_error",
      fileName,
    });
  }
}

export const logger = new Logger();
