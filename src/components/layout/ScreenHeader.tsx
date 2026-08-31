"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

export function ScreenHeader({
  title,
  rightSlot,
}: {
  title: string;
  rightSlot?: React.ReactNode;
}) {
  const router = useRouter();
  const t = useT();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <button
        onClick={() => router.back()}
        aria-label={t.common.back}
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground"
      >
        <ArrowLeft size={22} />
      </button>
      <h1 className="flex-1 text-xl font-semibold">{title}</h1>
      {rightSlot}
    </header>
  );
}
