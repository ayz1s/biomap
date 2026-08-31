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
    <nav className="sticky bottom-0 z-20 flex items-center justify-around border-t border-border bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
