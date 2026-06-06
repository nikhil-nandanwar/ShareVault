import type { Metadata } from "next";
import { RetrieveForm } from "@/components/RetrieveForm";

export const metadata: Metadata = {
  title: "Retrieve Shared Content - ShareVault",
  description:
    "Enter your 6-digit retrieval code to access shared text and files. Secure, fast, and privacy-focused content retrieval.",
  keywords: [
    "retrieve shared files",
    "download shared content",
    "secure file retrieval",
    "text retrieval",
    "file download",
    "share vault retrieve",
  ],
  openGraph: {
    title: "Retrieve Shared Content - ShareVault",
    description:
      "Enter your 6-digit retrieval code to access shared text and files.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retrieve Shared Content - ShareVault",
    description:
      "Enter your 6-digit retrieval code to access shared text and files.",
  },
  alternates: {
    canonical: "/retrieve",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RetrievePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <header className="border-b border-gray-200 px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              Retrieve
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Retrieve Files
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Enter the retrieval code to access shared content.
            </p>
          </header>

          <RetrieveForm />
        </section>

        <aside className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">How it works</h2>
          <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-5">
            <li>
              <strong>Upload:</strong> Files or text are uploaded to ShareVault.
            </li>
            <li>
              <strong>Get code:</strong> A unique 6-digit retrieval code is
              generated.
            </li>
            <li>
              <strong>Share:</strong> The code is shared with intended
              recipients.
            </li>
            <li>
              <strong>Retrieve:</strong> Paste the code here to access and
              download files.
            </li>
          </ol>
        </aside>
      </div>
    </main>
  );
}
