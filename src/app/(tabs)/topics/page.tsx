"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { TopicIcon } from "@/components/TopicIcon";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/lib/i18n";

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
  soloLessonId: string | null;
}

export default function TopicsPage() {
  const t = useT();
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
      <ScreenHeader title={t.topics.title} />
      <p className="text-sm text-muted-foreground">{t.topics.subtitle}</p>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-card shadow-card px-3 py-2">
        <Search size={18} className="text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.topics.searchPlaceholder}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {showSearch ? (
        <div className="flex flex-col gap-2">
          {(searchData?.results ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.topics.noResults}</p>
          ) : (
            searchData?.results.map((r) => (
              <Link
                key={r.id}
                href={r.soloLessonId ? `/lesson/${r.soloLessonId}` : `/topics/detail/${r.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card shadow-card p-3"
              >
                <span className="font-medium">{r.title}</span>
                <span className="text-sm text-muted-foreground">{t.classes.detailTitle(r.gradeNumber)}</span>
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
              className="flex items-center gap-3 rounded-xl border border-border bg-card shadow-card p-3"
            >
              <TopicIcon icon={category.icon} colorKey={category.colorKey} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{category.name}</p>
                  <span className="text-sm text-muted-foreground">{category.progress}%</span>
                </div>
                <p className="mb-1 text-xs text-muted-foreground">{t.home.topicsCount(category.topicCount)}</p>
                <Progress value={category.progress} className="h-1.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
