"use client";

import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n";

interface MistakeTopic {
  topicName: string;
  wrongCount: number;
  totalAttempts: number;
}

export default function MistakesPage() {
  const t = useT();
  const { data } = useQuery({
    queryKey: ["mistakes"],
    queryFn: () => fetchJson<{ topics: MistakeTopic[] }>("/api/mistakes"),
  });

  const topics = data?.topics ?? [];

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title={t.mistakes.title} />

      <Tabs defaultValue="topics">
        <TabsList>
          <TabsTrigger value="topics">{t.mistakes.tabTopics}</TabsTrigger>
          <TabsTrigger value="questions">{t.mistakes.tabQuestions}</TabsTrigger>
        </TabsList>
      </Tabs>

      {topics.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
            <Check size={26} className="text-primary-dark" strokeWidth={2.4} />
          </div>
          <p className="font-heading font-semibold text-foreground">{t.mistakes.emptyTitle}</p>
          <p className="max-w-[80%] text-sm text-muted-foreground">{t.mistakes.emptyHint}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {topics.map((topic) => {
            const percent = topic.totalAttempts === 0 ? 0 : Math.round((topic.wrongCount / topic.totalAttempts) * 100);
            return (
              <div key={topic.topicName} className="flex items-center justify-between rounded-xl border border-border bg-card shadow-card p-3">
                <div>
                  <p className="font-medium">{topic.topicName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.mistakes.countOf(topic.wrongCount, topic.totalAttempts)}
                  </p>
                </div>
                <span className="font-medium text-destructive">{percent}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
