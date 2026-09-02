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
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-[0_6px_14px_-6px_rgba(20,20,10,0.16)]"
      >
        <ArrowLeft size={19} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-heading text-[16.5px] leading-tight font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {rightSlot}
    </header>
  );
}
