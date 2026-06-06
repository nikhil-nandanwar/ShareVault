import type { Metadata } from "next";
import { FileUploadForm } from "@/components/FileUploadForm";

export const metadata: Metadata = {
  title: "Upload & Share Files Securely - ShareVault",
  description:
    "Upload up to 10 files (100MB each) and share them with a unique 6-digit retrieval code. Encrypted storage with automatic expiration.",
  keywords: [
    "share files online",
    "secure file sharing",
    "private file sharing",
    "encrypted file storage",
    "temporary file links",
    "file vault",
    "secure file upload",
  ],
  openGraph: {
    title: "Upload & Share Files Securely - ShareVault",
    description:
      "Upload up to 10 files (100MB each) and share them with a unique 6-digit retrieval code.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upload & Share Files Securely - ShareVault",
    description:
      "Upload up to 10 files (100MB each) and share them with a unique 6-digit retrieval code.",
  },
  alternates: {
    canonical: "/file",
  },
};

export default function FileSharePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <header className="border-b border-gray-200 px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              File Sharing
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Upload Files
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Share files securely with a unique retrieval code.
            </p>
          </header>

          <FileUploadForm />

          <div className="border-t border-gray-200 px-6 py-6 sm:px-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              File upload guidelines
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
              <li>Maximum 10 files per upload, 100MB per file</li>
              <li>Supported: images, PDFs, Office docs, archives, plain text</li>
              <li>Files are stored encrypted and expire automatically</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
