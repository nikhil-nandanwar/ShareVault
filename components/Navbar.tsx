import Link from "next/link";
import { NavLinks } from "./NavLinks";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold group-hover:from-blue-700 group-hover:to-blue-800 transition-colors">
              SV
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block group-hover:text-blue-600 transition-colors">
              ShareVault
            </h1>
          </Link>

          <NavLinks />
        </div>
      </div>
    </nav>
  );
}
