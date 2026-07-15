"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

interface TopicDetail {
  id: string;
  name: string;
  timeline: {
    gradeNumber: number;
    status: "ACTIVE" | "SOON";
    subtitle: string;
    firstLessonId: string | null;
    lessonsCompleted: number;
    lessonsTotal: number;
  }[];
  connections: { toTopicName: string; description: string }[];
}

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = use(params);
  const { data } = useQuery({
    queryKey: ["topic", topicId],
    queryFn: () => fetchJson<{ topic: TopicDetail }>(`/api/topics/${topicId}`),
  });
  const topic = data?.topic;

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const activeGrade = useMemo(() => {
    if (selectedGrade) return selectedGrade;
    return (
      topic?.timeline.find((t) => t.status === "ACTIVE" && t.firstLessonId)?.gradeNumber ??
      topic?.timeline.find((t) => t.status === "ACTIVE")?.gradeNumber ??
      topic?.timeline[0]?.gradeNumber ??
      null
    );
  }, [selectedGrade, topic]);

  const selectedEntry = topic?.timeline.find((t) => t.gradeNumber === activeGrade);

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title={topic?.name ?? ""} />

      {topic && (
        <>
          <p className="text-sm font-medium text-muted-foreground">Связь темы с классами</p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {topic.timeline.map((t) => (
              <button
                key={t.gradeNumber}
                onClick={() => setSelectedGrade(t.gradeNumber)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                  activeGrade === t.gradeNumber
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {t.gradeNumber} кл
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-l border-border pl-4">
            {topic.timeline.map((t) => (
              <div key={t.gradeNumber} className="relative">
                <span
                  className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full ${
                    activeGrade === t.gradeNumber ? "bg-primary" : "bg-muted-foreground/40"
                  }`}
                />
                <p
                  className={`font-medium ${
                    activeGrade === t.gradeNumber ? "text-primary" : "text-foreground"
                  }`}
                >
                  {t.gradeNumber} класс
                </p>
                <p className="text-sm text-muted-foreground">{t.subtitle}</p>
              </div>
            ))}
          </div>

          {selectedEntry?.firstLessonId ? (
            <Link
              href={`/lesson/${selectedEntry.firstLessonId}`}
              className="flex h-11 items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground"
            >
              Изучить тему
            </Link>
          ) : (
            <button
              disabled
              className="flex h-11 items-center justify-center rounded-xl bg-muted font-medium text-muted-foreground"
            >
              Скоро
            </button>
          )}

          {topic.connections.length > 0 && (
            <div className="rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
              Связано с темой «{topic.connections[0].toTopicName}»: {topic.connections[0].description}
            </div>
          )}
        </>
      )}
    </div>
  );
}
