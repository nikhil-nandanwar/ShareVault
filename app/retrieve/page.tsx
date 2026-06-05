"use client";

import React, { useState } from "react";

export default function RetrievePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const validate = (value: string) => /^\d{6}$/.test(value);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!validate(code)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/retrieve?code=${encodeURIComponent(code)}`);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data && typeof data.content === "string") {
        setResult(data.content);
      } else {
        setError("No content found for this code.");
      }
    } catch (error: unknown) {
      setError(error instanceof Error && error.message ? error.message : "Failed to retrieve content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-2xl border border-gray-300 bg-white p-6 shadow-sm sm:p-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Retrieve</p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Retrieve Uploaded Document</h1>
          <p className="max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Enter your 6-digit code to fetch previously uploaded content.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label htmlFor="code" className="text-sm font-medium text-gray-700">
            Enter 6-digit code
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="code"
              name="code"
              inputMode="numeric"
              pattern="\\d{6}"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {loading ? "Retrieving..." : "Retrieve"}
            </button>
          </div>
        </form>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {result && (
          <section className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Retrieved Content</h2>
            <div className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-6 text-gray-800 shadow-sm ring-1 ring-gray-200">
              {result}
            </div>
          </section>
        )}

        <p className="text-sm leading-6 text-gray-600">
          Tip: this page expects an API endpoint at /api/retrieve?code=XXXXXX that returns JSON.
        </p>
      </section>
    </main>
  );
}
