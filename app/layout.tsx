import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShareVault - Share Text and Files Securely",
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
        {children}
      </body>
    </html>
  );
}
