"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { TopicIcon } from "@/components/TopicIcon";
import { ChevronRight, ClipboardList } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Topic {
  id: string;
  name: string;
  icon: string;
  colorKey: string;
  hasLessons: boolean;
  firstLessonId: string | null;
}

export default function TestsPage() {
  const t = useT();
  const { data } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchJson<{ topics: Topic[] }>("/api/topics"),
  });

  const available = (data?.topics ?? []).filter((topic) => topic.hasLessons && topic.firstLessonId);

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title={t.nav.tests} />

      {available.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-locked-soft">
            <ClipboardList size={24} className="text-locked" strokeWidth={2.2} />
          </div>
          <p className="font-heading font-semibold text-foreground">{t.tests.emptyTitle}</p>
          <p className="max-w-[80%] text-sm text-muted-foreground">{t.tests.emptyHint}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {available.map((topic) => (
          <Link
            key={topic.id}
            href={`/test/${topic.firstLessonId}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card shadow-card p-3"
          >
            <TopicIcon icon={topic.icon} colorKey={topic.colorKey} />
            <span className="flex-1 font-medium">{topic.name}</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
