"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Badge } from "@/components/ui/badge";

interface GradeSummary {
  grade: number;
  count: number;
}

export default function MicroLessonsPage() {
  const { data } = useQuery({
    queryKey: ["microlessons-grades"],
    queryFn: () => fetchJson<{ grades: GradeSummary[] }>("/api/microlessons"),
  });

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title="Микроуроки" />
      <p className="-mt-2 text-sm text-muted-foreground">
        Короткие карточки прямо по параграфам учебника: суть, схема, связи с другими темами,
        частая ошибка и два вопроса на проверку.
      </p>

      <div className="flex flex-col gap-3">
        {(data?.grades ?? []).map((g) => (
          <Link
            key={g.grade}
            href={`/microlessons/${g.grade}`}
            className="flex items-center justify-between rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <p className="font-medium">{g.grade} класс</p>
            <Badge variant="secondary">{g.count} уроков</Badge>
          </Link>
        ))}

        {data && data.grades.length === 0 && (
          <p className="text-sm text-muted-foreground">Пока нет ни одного микро-урока.</p>
        )}
      </div>
    </div>
  );
}
