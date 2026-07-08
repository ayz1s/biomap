"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function ScreenHeader({
  title,
  rightSlot,
}: {
  title: string;
  rightSlot?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-3 px-4 py-4">
      <button
        onClick={() => router.back()}
        aria-label="Назад"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground"
      >
        <ArrowLeft size={22} />
      </button>
      <h1 className="flex-1 text-lg font-semibold">{title}</h1>
      {rightSlot}
    </header>
  );
}
