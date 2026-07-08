"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { TopicIcon } from "@/components/TopicIcon";
import { ChevronRight } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  icon: string;
  colorKey: string;
  hasLessons: boolean;
  firstLessonId: string | null;
}

export default function TestsPage() {
  const { data } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchJson<{ topics: Topic[] }>("/api/topics"),
  });

  const available = (data?.topics ?? []).filter((t) => t.hasLessons && t.firstLessonId);

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title="Тесты" />

      {available.length === 0 && (
        <p className="text-sm text-muted-foreground">Тесты появятся по мере изучения тем.</p>
      )}

      <div className="flex flex-col gap-3">
        {available.map((topic) => (
          <Link
            key={topic.id}
            href={`/test/${topic.firstLessonId}`}
            className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
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
