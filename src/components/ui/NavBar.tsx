"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { signOut } from "@/lib/actions/auth";

interface NavBarProps {
  isAdmin: boolean;
}

export function NavBar({ isAdmin }: NavBarProps) {
  const pathname = usePathname();

  const playerLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/match/new", label: "Match eintragen" },
    { href: "/", label: "Rangliste" },
  ];

  const adminLinks = [
    { href: "/admin", label: "Übersicht" },
    { href: "/admin/matches", label: "Matches" },
    { href: "/admin/users", label: "Spieler" },
  ];

  const links = isAdmin && pathname.startsWith("/admin") ? adminLinks : playerLinks;

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Logo size="sm" />
        <div className="flex gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-xs tracking-widest uppercase transition-colors ${
                pathname === href
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link
            href={pathname.startsWith("/admin") ? "/dashboard" : "/admin"}
            className="text-xs tracking-widest uppercase text-[var(--color-muted)] hover:text-[var(--color-accent)] border border-[var(--color-border)] hover:border-[var(--color-accent)] px-3 py-1.5 transition-colors"
          >
            {pathname.startsWith("/admin") ? "Spieler-UI" : "Admin-UI"}
          </Link>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs tracking-widest uppercase text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
          >
            Abmelden
          </button>
        </form>
      </div>
    </nav>
  );
}
