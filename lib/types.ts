export type UploadStatus = "idle" | "uploading" | "success" | "error";

export type UploadResponse = {
  files?: string[];
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