import type { Metadata } from "next";
import { TextUploadForm } from "@/components/TextUploadForm";

export const metadata: Metadata = {
  title: "Share Text Securely - ShareVault",
  description:
    "Share text snippets, notes, and code securely with a unique 6-digit retrieval code. Encrypted, private, and expires automatically.",
  keywords: [
    "share text online",
    "secure text sharing",
    "private text sharing",
    "encrypted text storage",
    "temporary text links",
    "text vault",
    "online clipboard",
  ],
  openGraph: {
    title: "Share Text Securely - ShareVault",
    description:
      "Share text snippets, notes, and code securely with a unique 6-digit retrieval code.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Text Securely - ShareVault",
    description:
      "Share text snippets, notes, and code securely with a unique 6-digit retrieval code.",
  },
  alternates: {
    canonical: "/text",
  },
};

export default function TextSharePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <header className="border-b border-gray-200 px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              Text Sharing
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Share Text Securely
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Upload your text and share it with a unique retrieval code.
            </p>
          </header>

          <TextUploadForm />

          <div className="border-t border-gray-200 px-6 py-6 sm:px-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Why ShareVault for text?
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
              <li>End-to-end encrypted storage with automatic expiration</li>
              <li>Share via a simple 6-digit code — no account required</li>
              <li>Perfect for snippets, credentials, or quick notes</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
