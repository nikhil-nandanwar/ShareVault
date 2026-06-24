"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Card, CardContent } from "@/components/ui/Card";
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
  const [copied, setCopied] = useState(false);

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

  const handleCopyCode = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setText("");
    setError(null);
    setSuccess(false);
    setCode(null);
    setCopied(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="error" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && code && (
            <Alert variant="success" className="mb-6">
              <AlertDescription>
                Text uploaded successfully. Share the code below with others.
              </AlertDescription>
            </Alert>
          )}

          <div>
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
        </form>

        {success && code && (
          <div className="mt-8 space-y-6 border-t border-gray-200 pt-8">
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
                Share this code with others. They can use it on the Retrieve
                page to access your text.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
