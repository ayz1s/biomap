"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

interface LessonListItem {
  id: string;
  order: number;
  title: string;
}

export default function MicroLessonsGradePage({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const { grade } = use(params);
  const { data } = useQuery({
    queryKey: ["microlessons", grade],
    queryFn: () => fetchJson<{ lessons: LessonListItem[] }>(`/api/microlessons/${grade}`),
  });

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title={`${grade} класс`} />

      <div className="flex flex-col gap-2">
        {(data?.lessons ?? []).map((lesson) => (
          <Link
            key={lesson.id}
            href={`/microlessons/${grade}/${lesson.order}`}
            className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
              {lesson.order}
            </span>
            <p className="flex-1 text-sm font-medium">{lesson.title}</p>
          </Link>
        ))}

        {data && data.lessons.length === 0 && (
          <p className="text-sm text-muted-foreground">В этом классе пока нет микро-уроков.</p>
        )}
      </div>
    </div>
  );
}
