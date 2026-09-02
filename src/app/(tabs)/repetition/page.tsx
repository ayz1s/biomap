"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Flame, RotateCcw } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

interface RepetitionItem {
  lessonId: string;
  lessonTitle: string;
  topicName: string;
  dueAt: string;
}

export default function RepetitionPage() {
  const t = useT();
  const { data } = useQuery({
    queryKey: ["repetition"],
    queryFn: () =>
      fetchJson<{ items: RepetitionItem[]; currentStreak: number }>("/api/repetition"),
  });

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title={t.nav.repetition} />

      <p className="text-sm font-medium text-foreground">
        {t.repetition.todayCount(items.length)} · {t.repetition.hint}
      </p>

      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-locked-soft">
              <RotateCcw size={24} className="text-locked" strokeWidth={2.2} />
            </div>
            <p className="text-sm text-muted-foreground">{t.repetition.empty}</p>
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.lessonId}
            className="flex items-center justify-between rounded-xl border border-border bg-card shadow-card p-3"
          >
            <div>
              <p className="text-xs text-muted-foreground">
                {new Date(item.dueAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="font-medium">
                {item.topicName}: {item.lessonTitle}
              </p>
            </div>
            <Link href={`/lesson/${item.lessonId}`} className="text-sm font-medium text-primary">
              {t.repetition.repeatButton}
            </Link>
          </div>
        ))}
      </div>

      <Card
        className="flex-row items-center gap-3 border-warning/30 p-4 text-foreground"
        style={{ background: "linear-gradient(135deg, var(--warning-soft), var(--card))" }}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card shadow-card">
          <Flame size={22} className="text-warning" strokeWidth={2.2} fill="currentColor" fillOpacity={0.15} />
        </div>
        <div>
          <p className="font-medium">{t.repetition.streak(data?.currentStreak ?? 0)}</p>
          <p className="text-sm text-muted-foreground">{t.repetition.onTrack}</p>
        </div>
      </Card>
    </div>
  );
}
