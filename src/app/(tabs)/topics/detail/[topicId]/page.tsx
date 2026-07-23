"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

interface TopicDetail {
  id: string;
  title: string;
  chapterTitle: string;
  gradeNumber: number;
  categoryName: string | null;
  lessons: { id: string; title: string; completed: boolean }[];
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

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title={topic?.title ?? ""} />

      {topic && (
        <>
          <p className="text-sm text-muted-foreground">
            {topic.gradeNumber} класс · {topic.chapterTitle}
            {topic.categoryName ? ` · ${topic.categoryName}` : ""}
          </p>

          {topic.lessons.length === 0 ? (
            <div className="flex h-11 items-center justify-center rounded-xl bg-muted font-medium text-muted-foreground">
              Скоро
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {topic.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lesson/${lesson.id}`}
                  className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/15"
                >
                  {lesson.completed ? (
                    <CheckCircle2 size={20} className="shrink-0 text-primary" />
                  ) : (
                    <Circle size={20} className="shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-medium">{lesson.title}</span>
                </Link>
              ))}
            </div>
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
