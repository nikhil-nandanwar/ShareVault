"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadResponse = {
  files?: string[];
  error?: string;
};

type DownloadResponse = {
  downloadUrl?: string;
  error?: string;
};

type UploadSelection = {
  files: File[];
  uploadedKeys: string[];
  activeKey: string;
  downloadUrl: string;
};

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

      const response = await fetch("/api/upload", {
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,124,255,0.24),_transparent_34%),linear-gradient(180deg,#050816_0%,#0a1222_100%)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/90">File Upload</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Backblaze B2 Document Storage</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Upload one or more files to the backend, then generate a time-limited download link for any stored object.
          </p>
        </header>

        <form onSubmit={handleUpload} className="grid gap-4">
          <label className="grid gap-3 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 transition hover:border-sky-300/40 hover:bg-white/[0.07]">
            <span className="text-sm font-medium text-slate-200">Select files</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={status === "uploading"}
              className="block w-full cursor-pointer rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-sky-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!hasSelectedFiles || status === "uploading"}
              className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {status === "uploading" ? "Uploading..." : "Upload Files"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={!hasSelectedFiles && !hasUploadedFiles && !selection.downloadUrl}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/25 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </form>

        {hasSelectedFiles && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Queued files</h2>
            <ul className="mt-3 grid gap-2 text-sm text-slate-200">
              {selection.files.map((file) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`} className="rounded-lg bg-white/5 px-3 py-2">
                  {file.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        {status === "success" && (
          <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-50">
            <p className="font-semibold">Upload completed successfully.</p>
            <p className="mt-2 text-sm leading-6 text-emerald-100/90">
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
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-300/60"
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
                className="inline-flex items-center justify-center rounded-xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                Generate Download Link
              </button>
            </div>

            {selection.downloadUrl && (
              <a
                href={selection.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-sky-200 underline decoration-sky-300/60 underline-offset-4 transition hover:text-sky-100"
              >
                Open the generated download link
              </a>
            )}
          </section>
        )}

        {status === "error" && (
          <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-100">
            Upload failed. Check the API response and retry.
          </p>
        )}
      </section>
    </main>
  );
}