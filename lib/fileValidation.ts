export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_FILES = 10;
export const MAX_FILENAME_LENGTH = 255;

export const ALLOWED_TYPES = [
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
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/x-7z-compressed",
  "application/x-tar",
  "application/gzip",
  "application/x-gzip",
  "application/x-bzip2",
  "application/x-xz",
];

export const ALLOWED_TYPE_PREFIXES = ["audio/", "video/"];

export const ARCHIVE_EXTENSIONS = [
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".tgz",
  ".bz2",
  ".xz",
];

export const DANGEROUS_PATTERNS = [
  /\.\./g, // Directory traversal
  /[<>:"|?*]/g, // Invalid characters
  /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Windows reserved names
];

export type FileMeta = {
  name: string;
  size: number;
  type: string;
};

function isAllowedFileType(file: FileMeta): boolean {
  const mimeType = file.type.toLowerCase();

  if (
    ALLOWED_TYPES.includes(mimeType) ||
    ALLOWED_TYPE_PREFIXES.some((prefix) => mimeType.startsWith(prefix))
  ) {
    return true;
  }

  // Some browsers report archives as an empty or generic binary MIME type.
  const hasArchiveExtension = ARCHIVE_EXTENSIONS.some((extension) =>
    file.name.toLowerCase().endsWith(extension),
  );

  return (
    hasArchiveExtension &&
    (mimeType === "" || mimeType === "application/octet-stream")
  );
}

export function validateFileMeta(file: FileMeta): string | null {
  if (!file.name?.trim()) {
    return "Each file must have a name";
  }

  if (file.name.length > MAX_FILENAME_LENGTH) {
    return `File name exceeds maximum length of ${MAX_FILENAME_LENGTH} characters`;
  }

  if (file.size === 0) {
    return `File "${file.name}" is empty`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" exceeds maximum size of 100MB`;
  }

  if (!isAllowedFileType(file)) {
    return `File "${file.name}" has unsupported type "${file.type || "unknown"}"`;
  }

  // Check for dangerous patterns in filename
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(file.name)) {
      return `File "${file.name}" contains invalid characters`;
    }
  }

  return null;
}

export function validateFileMetas(files: FileMeta[]): string | null {
  if (files.length === 0) {
    return "No files provided. Please select at least one file.";
  }

  if (files.length > MAX_FILES) {
    return `Maximum ${MAX_FILES} files allowed per upload`;
  }

  for (const file of files) {
    const error = validateFileMeta(file);
    if (error) {
      return error;
    }
  }

  return null;
}

export function sanitizeFileName(name: string): string {
  // Remove dangerous patterns
  let sanitized = name;

  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Replace remaining special characters with underscores
  sanitized = sanitized.replace(/[/\\]/g, "_");

  // Trim and limit length
  sanitized = sanitized.trim().slice(0, MAX_FILENAME_LENGTH);

  // Ensure filename is not empty after sanitization
  if (!sanitized) {
    sanitized = "unnamed_file";
  }

  return sanitized;
}

export function validateCode(code: string): boolean {
  // Code should be exactly 6 digits
  return /^\d{6}$/.test(code);
}
