"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/lib/i18n";

interface TopicSummary {
  id: string;
  title: string;
  hasLessons: boolean;
  lessonsCompleted: number;
  lessonsTotal: number;
  soloLessonId: string | null;
}

interface GradeCurriculum {
  gradeNumber: number;
  chapters: { chapterOrder: number; chapterTitle: string; topics: TopicSummary[] }[];
}

export default function GradeCurriculumPage({
  params,
}: {
  params: Promise<{ gradeNumber: string }>;
}) {
  const { gradeNumber } = use(params);
  const t = useT();
  const { data } = useQuery({
    queryKey: ["grade-curriculum", gradeNumber],
    queryFn: () => fetchJson<GradeCurriculum>(`/api/grades/${gradeNumber}`),
  });

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title={t.classes.detailTitle(gradeNumber)} />

      <div className="flex flex-col gap-5">
        {data?.chapters.map((chapter) => (
          <div key={chapter.chapterOrder} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">{chapter.chapterTitle}</p>
            <div className="flex flex-col gap-2">
              {chapter.topics.map((topic) => {
                const progress =
                  topic.lessonsTotal === 0
                    ? 0
                    : Math.round((topic.lessonsCompleted / topic.lessonsTotal) * 100);
                const content = (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                    <div className="flex-1">
                      <p className={topic.hasLessons ? "font-medium" : "font-medium text-muted-foreground"}>
                        {topic.title}
                      </p>
                      {topic.hasLessons ? (
                        <Progress value={progress} className="mt-1.5 h-1.5" />
                      ) : (
                        <p className="mt-0.5 text-xs text-muted-foreground">{t.common.soon}</p>
                      )}
                    </div>
                  </div>
                );
                return topic.hasLessons ? (
                  <Link
                    key={topic.id}
                    href={topic.soloLessonId ? `/lesson/${topic.soloLessonId}` : `/topics/detail/${topic.id}`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={topic.id} aria-disabled>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
