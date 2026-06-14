export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_FILES = 10;

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
  "application/x-rar-compressed",
  "application/x-7z-compressed",
];

export type FileMeta = {
  name: string;
  size: number;
  type: string;
};

export function validateFileMeta(file: FileMeta): string | null {
  if (!file.name?.trim()) {
    return "Each file must have a name";
  }

  if (file.size === 0) {
    return `File "${file.name}" is empty`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" exceeds maximum size of 100MB`;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return `File "${file.name}" has unsupported type "${file.type}"`;
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
  return name.replace(/[/\\]/g, "_").trim();
}
