"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MistakeTopic {
  topicName: string;
  wrongCount: number;
  totalAttempts: number;
}

export default function MistakesPage() {
  const { data } = useQuery({
    queryKey: ["mistakes"],
    queryFn: () => fetchJson<{ topics: MistakeTopic[] }>("/api/mistakes"),
  });

  const topics = data?.topics ?? [];

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title="Мои ошибки" />

      <Tabs defaultValue="topics">
        <TabsList>
          <TabsTrigger value="topics">Темы</TabsTrigger>
          <TabsTrigger value="questions">Вопросы</TabsTrigger>
        </TabsList>
      </Tabs>

      {topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет ошибок — отличная работа!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {topics.map((t) => {
            const percent = t.totalAttempts === 0 ? 0 : Math.round((t.wrongCount / t.totalAttempts) * 100);
            return (
              <div key={t.topicName} className="flex items-center justify-between rounded-xl bg-card p-3 ring-1 ring-foreground/15">
                <div>
                  <p className="font-medium">{t.topicName}</p>
                  <p className="text-sm text-muted-foreground">
                    Ошибок: {t.wrongCount} из {t.totalAttempts}
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
