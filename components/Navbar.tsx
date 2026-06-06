"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname() || "/";
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
              SV
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">ShareVault</h1>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/text"
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive("/text")
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Share Text
            </Link>
            <Link
              href="/file"
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive("/file")
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Share Files
            </Link>
            <Link
              href="/retrieve"
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive("/retrieve")
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Retrieve
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
