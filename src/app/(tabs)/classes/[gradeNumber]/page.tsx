"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/lib/i18n";

// Статус изучения темы — цветная полоса слева карточки + значок-кружок,
// отдельно от факта принадлежности к маршруту (см. дизайн-спеку §1.9/§5).
function TopicStatusRow({
  progress,
  hasLessons,
  children,
}: {
  progress: number;
  hasLessons: boolean;
  children: React.ReactNode;
}) {
  const done = hasLessons && progress >= 100;
  const inProgress = hasLessons && progress > 0 && progress < 100;
  const borderClass = done ? "border-l-primary" : inProgress ? "border-l-warning" : "border-l-transparent";
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-border border-l-4 bg-card shadow-card p-3 ${borderClass}`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {done ? (
        <span className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check size={11} strokeWidth={3} />
        </span>
      ) : inProgress ? (
        <span className="h-[17px] w-[17px] shrink-0 rounded-full bg-warning" />
      ) : hasLessons ? (
        <span className="h-[17px] w-[17px] shrink-0 rounded-full border-[1.5px] border-locked" />
      ) : null}
    </div>
  );
}

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
                  <TopicStatusRow progress={progress} hasLessons={topic.hasLessons}>
                    <p className={topic.hasLessons ? "truncate font-medium" : "truncate font-medium text-muted-foreground"}>
                      {topic.title}
                    </p>
                    {topic.hasLessons ? (
                      <Progress value={progress} className="mt-1.5 h-1.5" />
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground">{t.common.soon}</p>
                    )}
                  </TopicStatusRow>
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
