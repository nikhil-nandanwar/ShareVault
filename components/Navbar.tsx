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
    <>
      <nav className="w-full bg-blue-400 p-4 flex justify-center ">
        <div className="w-3/5  flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">ShareVault</h1>
          </div>
          <div className="flex justify-between items-center w-3/7 bg-yellow-400">
            <Link
              href="/text"
              className={`mx-2 ${isActive("/text") ? "text-gray-900 font-bold underline" : "text-gray-700 hover:text-gray-900"}`}
            >
              Text
            </Link>
            <Link
              href="/file"
              className={`mx-2 ${isActive("/file") ? "text-gray-900 font-bold underline" : "text-gray-700 hover:text-gray-900"}`}
            >
              File
            </Link>
            <Link
              href="/retrieve"
              className={`mx-2 ${isActive("/retrieve") ? "text-gray-900 font-bold underline" : "text-gray-700 hover:text-gray-900"}`}
            >
              Retrieve
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
