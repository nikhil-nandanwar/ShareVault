"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { X } from "lucide-react";
import { UploadResponse, UploadSelection, UploadStatus } from "@/lib/types";
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

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function FileUploadForm() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [selection, setSelection] = useState<UploadSelection>(
    createInitialSelection(),
  );
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copied, setCopied] = useState(false);

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

      const formData = new FormData();
      selection.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/file", {
        method: "POST",
        body: formData,
      });

      const body: UploadResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.log("UPLOAD ERROR", body);
        throw new Error(body.error ?? "Failed to upload files.");
      }

      const uploadedKeys = body.files ?? [];
      const code = body.code ?? "";

      if (uploadedKeys.length === 0) {
        throw new Error("Upload completed but no files were found.");
      }

      setSelection((currentSelection) => ({
        ...currentSelection,
        uploadedKeys,
        activeKey: uploadedKeys[0],
        files: [],
      }));
      setCode(code);
      setUploadProgress(100);
      setStatus("success");
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, "Failed to upload files.");
      setError(errorMsg);
      setStatus("error");
    }
  };

  const handleCopyCode = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const removeFile = (index: number) => {
    setSelection((currentSelection) => ({
      ...currentSelection,
      files: currentSelection.files.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setSelection(createInitialSelection());
    setStatus("idle");
    setError(null);
    setCode(null);
    setUploadProgress(0);
    setCopied(false);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent>
        {error && (
          <Alert variant="error" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-all duration-200 hover:border-blue-400 hover:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <label className="cursor-pointer block">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
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
                aria-label="Upload files"
              />
            </label>
          </div>

          {hasSelectedFiles && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                <span>Selected Files ({selection.files.length})</span>
                <Badge variant="default">{selection.files.length} / 10</Badge>
              </h3>
              <ul className="space-y-2">
                {selection.files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between rounded-lg bg-white px-4 py-3 border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span
                        className="text-2xl"
                        role="img"
                        aria-label="File type icon"
                      >
                        {}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={status === "uploading"}
                      className="ml-3 p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {status === "uploading" && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-blue-900">
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Uploading files...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onClick={resetForm}
              disabled={status === "uploading"}
              variant="secondary"
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={!hasSelectedFiles || status === "uploading"}
              isLoading={status === "uploading"}
              isCompleted={status === "success"}
            >
              Upload Files
            </Button>
          </div>
        </form>

        {status === "success" && hasUploadedFiles && code && (
          <div className="mt-8 space-y-6 border-t border-gray-200 pt-8">
            <Alert variant="success">
              <AlertDescription>
                Files uploaded successfully. {selection.uploadedKeys.length}{" "}
                file(s) ready to share.
              </AlertDescription>
            </Alert>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                Retrieval Code
              </h3>
              <div className="flex items-center gap-3">
                <code className="flex-1 rounded-lg bg-white px-4 py-3 font-mono text-lg font-bold text-gray-900 border border-blue-200 text-center">
                  {code}
                </code>
                <Button
                  type="button"
                  onClick={handleCopyCode}
                  variant={copied ? "success" : "primary"}
                  size="md"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="mt-3 text-xs text-blue-700">
                Share this code with others to retrieve your files. Files expire
                in 7 days.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
