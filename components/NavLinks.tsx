"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/text", label: "Share Text" },
  { href: "/file", label: "Share Files" },
  { href: "/retrieve", label: "Retrieve" },
] as const;

export function NavLinks() {
  const pathname = usePathname() || "/";

  return (
    <div className="flex items-center gap-8">
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
