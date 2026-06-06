"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { FormEvent, useState } from "react";

type ContentData = {
  message?: string;
  code?: string;
  error?: string;
};

export default function TextUploadPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setCode(null);

    if (!text.trim()) {
      setError("Please enter some text before uploading.");
      return;
    }

    if (text.trim().length < 3) {
      setError("Text must be at least 3 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data: ContentData = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Upload failed with status ${response.status}`
        );
      }

      if (!data.code) {
        throw new Error("No retrieval code received from server.");
      }

      setCode(data.code);
      setSuccess(true);
      setText("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload text.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
    }
  };

  const handleReset = () => {
    setText("");
    setError(null);
    setSuccess(false);
    setCode(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              Text Sharing
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Share Text Securely
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Upload your text and share it with a unique retrieval code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-8 sm:px-8">
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {success && code && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  Text uploaded successfully. Share the code below with others.
                </p>
              </div>
            )}

            <div className="mb-6">
              <label
                htmlFor="text-upload"
                className="block text-sm font-semibold text-gray-900 mb-3"
              >
                Your Text
              </label>
              <textarea
                id="text-upload"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                rows={8}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <div className="mt-2 text-xs text-gray-500">
                {text.length} character{text.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading || (!text && !success)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Uploading...
                  </>
                ) : (
                  "Upload Text"
                )}
              </button>
            </div>

            {success && code && (
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-900 mb-3">
                  Retrieval Code
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 rounded bg-white px-4 py-3 font-mono text-lg font-bold text-gray-900 border border-blue-200">
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
                  Share this code with others. They can use it on the Retrieve page to access your text.
                </p>
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
