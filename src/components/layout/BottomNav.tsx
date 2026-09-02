"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ClipboardList, RotateCcw, User } from "lucide-react";
import { useT } from "@/lib/i18n";

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  const items = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/topics", label: t.nav.topics, icon: BookOpen },
    { href: "/tests", label: t.nav.tests, icon: ClipboardList },
    { href: "/repetition", label: t.nav.repetition, icon: RotateCcw },
    { href: "/profile", label: t.nav.profile, icon: User },
  ];

  return (
    <nav
      className="sticky bottom-0 z-20 mx-3.5 mb-4 flex items-center gap-1 rounded-3xl border border-border bg-card p-[7px] shadow-[0_14px_28px_-12px_rgba(20,20,10,0.22)]"
      style={{ marginBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex h-11 items-center justify-center gap-1.5 rounded-2xl text-sm font-medium transition-colors ${
              active
                ? "grow-[1.7] basis-0 bg-primary-soft px-3 text-primary-dark"
                : "grow basis-0 text-muted-foreground"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            {active && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
