"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { TopicIcon } from "@/components/TopicIcon";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Topic {
  id: string;
  name: string;
  icon: string;
  colorKey: string;
  minGrade: number | null;
  maxGrade: number | null;
  progress: number;
  hasLessons: boolean;
}

export default function TopicsPage() {
  const [filter, setFilter] = useState<"all" | "learning" | "done">("all");
  const { data } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchJson<{ topics: Topic[] }>("/api/topics"),
  });

  const topics = (data?.topics ?? []).filter((t) => {
    if (filter === "learning") return t.progress > 0 && t.progress < 100;
    if (filter === "done") return t.progress === 100;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title="Сквозные темы" />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">Все темы</TabsTrigger>
          <TabsTrigger value="learning">Изучаю</TabsTrigger>
          <TabsTrigger value="done">Закрепил</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.id}`}
            className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/15"
          >
            <TopicIcon icon={topic.icon} colorKey={topic.colorKey} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{topic.name}</p>
                <span className="text-sm text-muted-foreground">{topic.progress}%</span>
              </div>
              <p className="mb-1 text-xs text-muted-foreground">
                {topic.minGrade}–{topic.maxGrade} классы
              </p>
              <Progress value={topic.progress} className="h-1.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
