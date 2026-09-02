"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

export function ScreenHeader({
  title,
  subtitle,
  rightSlot,
}: {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}) {
  const router = useRouter();
  const t = useT();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-background pt-4 pb-2">
      <button
        onClick={() => router.back()}
        aria-label={t.common.back}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-border bg-card text-foreground shadow-card"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-heading text-[15.5px] leading-tight font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {rightSlot}
    </header>
  );
}
