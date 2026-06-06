"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { DownloadResponse, UploadResponse, UploadSelection, UploadStatus } from "@/lib/types";
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

export default function UploadPage() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [selection, setSelection] = useState<UploadSelection>(createInitialSelection());
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

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
      setSelection((currentSelection) => ({
        ...currentSelection,
        uploadedKeys: [],
        activeKey: "",
        downloadUrl: "",
      }));

      const formData = new FormData();
      selection.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/file", {
        method: "POST",
        body: formData,
      });

      const responseBody: UploadResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseBody.error ?? "Failed to upload files.");
      }

      const uploadedKeys = responseBody.files ?? [];
      const uploadCode = responseBody.code ?? "";

      if (uploadedKeys.length === 0) {
        throw new Error("Upload API returned no file keys.");
      }

      setSelection((currentSelection) => ({
        ...currentSelection,
        uploadedKeys,
        activeKey: uploadedKeys[0],
      }));
      setCode(uploadCode);
      setStatus("success");
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, "Failed to upload files.");
      setError(errorMsg);
      setStatus("error");
    }
  };

  const handleDownloadFetch = async (fileKey: string) => {
    if (!fileKey) {
      return;
    }

    try {
      const response = await fetch(
        `/api/download?fileKey=${encodeURIComponent(fileKey)}`
      );
      const responseBody: DownloadResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseBody.error ?? "Failed to create download link."
        );
      }

      if (!responseBody.downloadUrl) {
        throw new Error("Download API returned an invalid response.");
      }

      setSelection((currentSelection) => ({
        ...currentSelection,
        downloadUrl: responseBody.downloadUrl ?? "",
        activeKey: fileKey,
      }));
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Error generating download link."));
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
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              File Sharing
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Upload Files
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Share files securely with a unique retrieval code.
            </p>
          </div>

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
                    Files uploaded successfully. {selection.uploadedKeys.length} file(s) ready to share.
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
                      className="flex-shrink-0 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-blue-700">
                    Share this code with others to retrieve your files.
                  </p>
                </div>


                {selection.downloadUrl && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-semibold text-green-900 mb-3">
                      Download link generated
                    </p>
                    <a
                      href={selection.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
                    >
                      Download File
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}