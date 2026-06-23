"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RetrieveResponse } from "@/lib/types";
import { FormEvent, useState } from "react";

type RetrieveResult = {
  type: "text" | "files";
  data?: string;
  files?: RetrieveResponse[];
};

export function RetrieveForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RetrieveResult | null>(null);

  const validate = (value: string) => /^\d{6}$/.test(value);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!validate(code)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/download?code=${encodeURIComponent(code)}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "No content found for this code. Please check and try again.",
          );
        }
        throw new Error(
          `Failed to retrieve content. Status: ${response.status}`,
        );
      }

      const data = await response.json();

      if (data.data && data.source === "database") {
        setResult({
          type: "text",
          data: data.data,
        });
      } else if (
        data.files &&
        Array.isArray(data.files) &&
        data.source === "r2"
      ) {
        if (data.files.length === 0) {
          setError(
            "The code is valid, but no files found. The content may have expired.",
          );
        } else {
          setResult({
            type: "files",
            files: data.files,
          });
        }
      } else {
        throw new Error(
          "Received invalid response from server. Please try again.",
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Failed to retrieve content. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="px-6 py-8 sm:px-8">
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Retrieval Code
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="code"
                name="code"
                inputMode="numeric"
                type="text"
                value={code}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "");
                  setCode(value.slice(0, 6));
                }}
                placeholder="123456"
                maxLength={6}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <button
                type="submit"
                disabled={loading || !validate(code)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 shrink-0"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Retrieving...
                  </>
                ) : (
                  "Retrieve"
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Enter the 6-digit code you received when content was uploaded.
            </p>
          </div>
        </div>
      </form>

      {result && result.type === "text" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              Text content retrieved successfully.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                if (result.data) {
                  navigator.clipboard.writeText(result.data);
                }
              }}
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Copy
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-900 whitespace-pre-wrap wrap-break-word">
                {result.data}
              </p>
            </div>
          </div>
        </div>
      )}

      {result &&
        result.type === "files" &&
        result.files &&
        result.files.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                {result.files.length} file
                {result.files.length !== 1 ? "s" : ""} found and ready for
                download.
              </p>
            </div>

            <div className="space-y-3">
              {result.files.map((file, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-white transition"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {file.fileName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatFileSize(file.sizeInBytes)}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <a
                      href={file.presignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                      Preview
                    </a>
                    <a
                      href={file.directDownloadLink}
                      download
                      className="inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                Download links expire after 1 hour. Please download your files
                within this time frame.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
