export type UploadStatus = "idle" | "uploading" | "success" | "error";

export type UploadResponse = {
  files?: string[];
  code?: string;
  message?: string;
  error?: string;
};

export type DownloadResponse = {
  downloadUrl?: string;
  error?: string;
};

export type UploadSelection = {
  files: File[];
  uploadedKeys: string[];
  activeKey: string;
  downloadUrl: string;
};

export type RetrieveResponse = {
  fileName: string;
  sizeInBytes: number;
  presignedUrl: string;
  directDownloadLink: string;
};

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type FileMetadata = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};
