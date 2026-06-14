"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  FileInitResponse,
  UploadResponse,
  UploadSelection,
  UploadStatus,
} from "@/lib/types";
import { useState, type ChangeEvent, type FormEvent } from "react";

function createInitialSelection(): UploadSelection {
  return {
    files: [],
    uploadedKeys: [],
    activeKey: "",
    downloadUrl: "",
  };
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallbackMessage;
}

function uploadFileToR2(
  file: File,
  presignedUrl: string,
  onProgress: (loaded: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      reject(new Error(`Upload failed for "${file.name}" (${xhr.status})`));
    });

    xhr.addEventListener("error", () => {
      reject(new Error(`Network error while uploading "${file.name}"`));
    });

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.send(file);
  });
}

export function FileUploadForm() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [selection, setSelection] = useState<UploadSelection>(
    createInitialSelection(),
  );
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const hasSelectedFiles = selection.files.length > 0;
  const hasUploadedFiles = selection.uploadedKeys.length > 0;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setError(null);
    setSelection({
      files: nextFiles,
      uploadedKeys: [],
      activeKey: "",
      downloadUrl: "",
    });
    setUploadProgress(0);
    setStatus("idle");
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!hasSelectedFiles) {
      setError("Please select at least one file.");
      return;
    }

    try {
      setStatus("uploading");
      setUploadProgress(0);
      setSelection((currentSelection) => ({
        ...currentSelection,
        uploadedKeys: [],
        activeKey: "",
        downloadUrl: "",
      }));

      const initResponse = await fetch("/api/file/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: selection.files.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
          })),
        }),
      });

      const initBody: FileInitResponse = await initResponse
        .json()
        .catch(() => ({}));

      if (!initResponse.ok) {
        throw new Error(initBody.error ?? "Failed to prepare file upload.");
      }

      if (!initBody.code || !initBody.uploads?.length) {
        throw new Error("Upload API returned an invalid upload session.");
      }

      const totalBytes = selection.files.reduce((sum, file) => sum + file.size, 0);
      const loadedByFile = new Array(selection.files.length).fill(0);

      await Promise.all(
        initBody.uploads.map((upload, index) => {
          const file = selection.files[index];

          if (!file) {
            throw new Error("Upload session does not match selected files.");
          }

          return uploadFileToR2(file, upload.presignedUrl, (loaded) => {
            loadedByFile[index] = loaded;
            const totalLoaded = loadedByFile.reduce((sum, value) => sum + value, 0);
            setUploadProgress(
              totalBytes > 0 ? Math.round((totalLoaded / totalBytes) * 100) : 0,
            );
          });
        }),
      );

      const completeResponse = await fetch("/api/file/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: initBody.code }),
      });

      const completeBody: UploadResponse = await completeResponse
        .json()
        .catch(() => ({}));

      if (!completeResponse.ok) {
        throw new Error(completeBody.error ?? "Failed to finalize upload.");
      }

      const uploadedKeys = completeBody.files ?? initBody.uploads.map((upload) => upload.key);

      if (uploadedKeys.length === 0) {
        throw new Error("Upload completed but no files were found.");
      }

      setSelection((currentSelection) => ({
        ...currentSelection,
        uploadedKeys,
        activeKey: uploadedKeys[0],
      }));
      setCode(initBody.code);
      setUploadProgress(100);
      setStatus("success");
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, "Failed to upload files.");
      setError(errorMsg);
      setStatus("error");
    }
  };

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
    }
  };

  const resetForm = () => {
    setSelection(createInitialSelection());
    setStatus("idle");
    setError(null);
    setCode(null);
    setUploadProgress(0);
  };

  return (
    <div className="px-6 py-8 sm:px-8">
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition hover:border-blue-400 hover:bg-white">
          <label className="cursor-pointer">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF, DOC, or any file up to 100MB
              </p>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={status === "uploading"}
              className="hidden"
            />
          </label>
        </div>

        {hasSelectedFiles && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Selected Files ({selection.files.length})
            </h3>
            <ul className="space-y-2">
              {selection.files.map((file) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-3 border border-gray-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {status === "uploading" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-blue-900">
              <span>Uploading ...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetForm}
            disabled={status === "uploading"}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={!hasSelectedFiles || status === "uploading"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {status === "uploading" ? (
              <>
                <LoadingSpinner size="sm" />
                Uploading...
              </>
            ) : (
              "Upload Files"
            )}
          </button>
        </div>
      </form>

      {status === "success" && hasUploadedFiles && code && (
        <div className="mt-8 space-y-6 border-t border-gray-200 pt-8">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              Files uploaded successfully. {selection.uploadedKeys.length}{" "}
              file(s) ready to share.
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <p className="text-sm font-semibold text-blue-900 mb-3">
              Retrieval Code
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-lg bg-white px-4 py-3 font-mono text-lg font-bold text-gray-900 border border-blue-200">
                {code}
              </code>
              <button
                type="button"
                onClick={handleCopyCode}
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Copy
              </button>
            </div>
            <p className="mt-3 text-xs text-blue-700">
              Share this code with others to retrieve your files.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
