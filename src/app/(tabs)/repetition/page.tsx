"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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

      <div>
        <p className="text-sm font-medium">{t.repetition.todayCount(items.length)}</p>
        <p className="text-xs text-muted-foreground">{t.repetition.hint}</p>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.repetition.empty}</p>
        )}
        {items.map((item) => (
          <div
            key={item.lessonId}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
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

      <Card className="flex-row items-center gap-3 bg-secondary p-4 text-secondary-foreground">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="font-medium">{t.repetition.streak(data?.currentStreak ?? 0)}</p>
          <p className="text-sm">{t.repetition.onTrack}</p>
        </div>
      </Card>
    </div>
  );
}
