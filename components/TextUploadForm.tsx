"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { FormEvent, useState } from "react";

type ContentData = {
  message?: string;
  code?: string;
  error?: string;
};

export function TextUploadForm() {
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
        cache: "no-store",
      });

      const data: ContentData = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Upload failed with status ${response.status}`,
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
        <Button
          type="button"
          onClick={handleReset}
          disabled={loading || (!text && !success)}
          variant="secondary"
        >
          Clear
        </Button>
        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          isCompleted={success}
        >
          Upload Text
        </Button>
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
            <Button
              type="button"
              onClick={handleCopyCode}
              size="md"
            >
              Copy
            </Button>
          </div>
          <p className="mt-3 text-xs text-blue-700">
            Share this code with others. They can use it on the Retrieve page to
            access your text.
          </p>
        </div>
      )}
    </form>
  );
}
