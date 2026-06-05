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

export type RetrieveResponse = {
  fileName: string;
  sizeInBytes: number ;
  presignedUrl: string;
  directDownloadLink: string;
};