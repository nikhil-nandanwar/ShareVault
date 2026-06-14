export type UploadStatus = "idle" | "uploading" | "success" | "error";

export type UploadResponse = {
  files?: string[];
  code?: string;
  message?: string;
  error?: string;
};

export type FileInitUpload = {
  fileName: string;
  key: string;
  presignedUrl: string;
};

export type FileInitResponse = {
  code?: string;
  uploads?: FileInitUpload[];
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
