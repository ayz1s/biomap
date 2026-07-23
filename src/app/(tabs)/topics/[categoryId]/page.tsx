"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Progress } from "@/components/ui/progress";

interface CategoryTopic {
  id: string;
  title: string;
  chapterTitle: string;
  hasLessons: boolean;
  lessonsCompleted: number;
  lessonsTotal: number;
}

interface CategoryDetail {
  id: string;
  name: string;
  grades: { gradeNumber: number; topics: CategoryTopic[] }[];
}

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = use(params);
  const { data } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => fetchJson<{ category: CategoryDetail }>(`/api/categories/${categoryId}`),
  });
  const category = data?.category;

  const [filter, setFilter] = useState("");
  const filteredGrades = useMemo(() => {
    if (!category) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return category.grades;
    return category.grades
      .map((g) => ({ ...g, topics: g.topics.filter((t) => t.title.toLowerCase().includes(q)) }))
      .filter((g) => g.topics.length > 0);
  }, [category, filter]);

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title={category?.name ?? ""} />

      <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-foreground/15">
        <Search size={18} className="text-muted-foreground" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Поиск темы в разделе"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="flex flex-col gap-5">
        {filteredGrades.map((g) => (
          <div key={g.gradeNumber} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">{g.gradeNumber} класс</p>
            <div className="flex flex-col gap-2">
              {g.topics.map((topic) => {
                const progress =
                  topic.lessonsTotal === 0
                    ? 0
                    : Math.round((topic.lessonsCompleted / topic.lessonsTotal) * 100);
                const content = (
                  <div className="flex items-center justify-between rounded-xl bg-card p-3 ring-1 ring-foreground/15">
                    <div className="flex-1">
                      <p className={topic.hasLessons ? "font-medium" : "font-medium text-muted-foreground"}>
                        {topic.title}
                      </p>
                      <p className="mb-1 text-xs text-muted-foreground">{topic.chapterTitle}</p>
                      {topic.hasLessons ? (
                        <Progress value={progress} className="h-1.5" />
                      ) : (
                        <p className="text-xs text-muted-foreground">Скоро</p>
                      )}
                    </div>
                  </div>
                );
                return topic.hasLessons ? (
                  <Link key={topic.id} href={`/topics/detail/${topic.id}`}>
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
