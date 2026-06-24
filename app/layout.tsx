import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv;
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  return "https://sharevault.example.com";
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "ShareVault - Share Text and Files Securely",
    template: "%s | ShareVault",
  },
  description:
    "ShareVault is a secure and user-friendly platform for sharing text and files. Upload your content and get a unique link to share with others. Your data is encrypted and stored securely, ensuring privacy and peace of mind.",
  keywords: [
    "file sharing",
    "text sharing",
    "secure file upload",
    "encrypted storage",
    "temporary download links",
    "privacy-focused sharing",
    "ShareVault",
    "online-clipboard",
    "Online Clipboard",
    "file vault",
    "secure sharing platform",
    "data protection",
    "confidential sharing",
    "file hosting",
    "text hosting",
    "share files online",
    "share text online",
    "secure file sharing service",
    "encrypted file storage",
    "temporary file links",
    "private text sharing",
    "secure data sharing",
    "file upload and share",
    "text upload and share",
  ],
  applicationName: "ShareVault",
  authors: [{ name: "ShareVault" }],
  creator: "ShareVault",
  publisher: "ShareVault",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ShareVault",
    title: "ShareVault - Share Text and Files Securely",
    description:
      "Secure, encrypted, and privacy-focused text and file sharing with unique retrieval codes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShareVault - Share Text and Files Securely",
    description:
      "Secure, encrypted, and privacy-focused text and file sharing with unique retrieval codes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
