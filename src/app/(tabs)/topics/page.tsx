"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { TopicIcon } from "@/components/TopicIcon";
import { Progress } from "@/components/ui/progress";

interface Category {
  id: string;
  name: string;
  icon: string;
  colorKey: string;
  topicCount: number;
  progress: number;
  hasLessons: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  gradeNumber: number;
}

export default function TopicsPage() {
  const { data } = useQuery({
    queryKey: ["topic-categories"],
    queryFn: () => fetchJson<{ categories: Category[] }>("/api/topics"),
  });

  const [query, setQuery] = useState("");
  const { data: searchData } = useQuery({
    queryKey: ["topic-search", query],
    queryFn: () => fetchJson<{ results: SearchResult[] }>(`/api/topics/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
  });

  const showSearch = query.trim().length >= 2;

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title="По темам" />
      <p className="text-sm text-muted-foreground">
        Все темы 5–11 классов по разделам биологии — удобно готовиться к экзамену по предмету, а не по классам.
      </p>

      <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-foreground/15">
        <Search size={18} className="text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск темы по всей программе"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {showSearch ? (
        <div className="flex flex-col gap-2">
          {(searchData?.results ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Ничего не найдено</p>
          ) : (
            searchData?.results.map((r) => (
              <Link
                key={r.id}
                href={`/topics/detail/${r.id}`}
                className="flex items-center justify-between rounded-xl bg-card p-3 ring-1 ring-foreground/15"
              >
                <span className="font-medium">{r.title}</span>
                <span className="text-sm text-muted-foreground">{r.gradeNumber} класс</span>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(data?.categories ?? []).map((category) => (
            <Link
              key={category.id}
              href={`/topics/${category.id}`}
              className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/15"
            >
              <TopicIcon icon={category.icon} colorKey={category.colorKey} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{category.name}</p>
                  <span className="text-sm text-muted-foreground">{category.progress}%</span>
                </div>
                <p className="mb-1 text-xs text-muted-foreground">{category.topicCount} тем</p>
                <Progress value={category.progress} className="h-1.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
