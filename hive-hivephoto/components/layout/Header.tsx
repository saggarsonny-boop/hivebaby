"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { href: "/", label: "Gallery" },
  { href: "/upload", label: "Upload" },
  { href: "/search", label: "Search" },
  { href: "/people", label: "People" },
  { href: "/map", label: "Map" },
  { href: "/duplicates", label: "Duplicates" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-hive-dark/90 backdrop-blur border-b border-hive-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="text-hive-gold font-semibold text-lg tracking-tight">
          HivePhoto
        </Link>

        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                pathname === item.href
                  ? "bg-hive-gold/20 text-hive-gold"
                  : "text-gray-400 hover:text-white hover:bg-hive-border"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/account"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Account
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
