"use client";

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
  const [selection, setSelection] = useState<UploadSelection>(createInitialSelection);

  const hasSelectedFiles = selection.files.length > 0;
  const hasUploadedFiles = selection.uploadedKeys.length > 0;
  const selectedKey = selection.activeKey || selection.uploadedKeys[0] || "";

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);

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

    if (!hasSelectedFiles) {
      setStatus("error");
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

      if (uploadedKeys.length === 0) {
        throw new Error("Upload API returned no file keys.");
      }

      setSelection((currentSelection) => ({
        ...currentSelection,
        uploadedKeys,
        activeKey: uploadedKeys[0],
      }));
      setStatus("success");
    } catch (error: unknown) {
      console.error(error);
      alert(getErrorMessage(error, "Something went wrong during the upload process."));
      setStatus("error");
    }
  };

  const handleDownloadFetch = async (fileKey: string) => {
    if (!fileKey) {
      return;
    }

    try {
      const response = await fetch(`/api/download?fileKey=${encodeURIComponent(fileKey)}`);
      const responseBody: DownloadResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseBody.error ?? "Failed to create download link.");
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
      alert(getErrorMessage(error, "Error generating download link."));
    }
  };

  const resetForm = () => {
    setSelection(createInitialSelection());
    setStatus("idle");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-2xl border border-gray-300 bg-white p-6 shadow-sm sm:p-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">File Upload</p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Upload Files</h1>
          <p className="max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Upload one or more files and generate a time-limited download link for any stored object.
          </p>
        </header>

        <form onSubmit={handleUpload} className="grid gap-4">
          <label className="grid gap-3 rounded-2xl border border-gray-300 bg-gray-50 p-4 transition hover:border-blue-300 hover:bg-white">
            <span className="text-sm font-medium text-gray-700">Select files</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={status === "uploading"}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!hasSelectedFiles || status === "uploading"}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {status === "uploading" ? "Uploading..." : "Upload Files"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={!hasSelectedFiles && !hasUploadedFiles && !selection.downloadUrl}
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </form>

        {hasSelectedFiles && (
          <section className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Queued files</h2>
            <ul className="mt-3 grid gap-2 text-sm text-gray-700">
              {selection.files.map((file) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`} className="rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-gray-200">
                  {file.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        {status === "success" && (
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950">
            <p className="font-semibold">Upload completed successfully.</p>
            <p className="mt-2 text-sm leading-6 text-blue-900/90">
              Stored keys:
              <br />
              {selection.uploadedKeys.join(", ")}
            </p>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
              <select
                value={selectedKey}
                onChange={(event) =>
                  setSelection((currentSelection) => ({
                    ...currentSelection,
                    activeKey: event.target.value,
                  }))
                }
                className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-500"
              >
                {selection.uploadedKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleDownloadFetch(selectedKey)}
                disabled={!selectedKey}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                Generate Download Link
              </button>
            </div>

            {selection.downloadUrl && (
              <a
                href={selection.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-blue-700 underline decoration-blue-400/60 underline-offset-4 transition hover:text-blue-800"
              >
                Open the generated download link
              </a>
            )}
          </section>
        )}

        {status === "error" && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Upload failed. Check the API response and retry.
          </p>
        )}
      </section>
    </main>
  );
}