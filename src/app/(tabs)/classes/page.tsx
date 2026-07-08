"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/card";

interface Grade {
  id: string;
  number: number;
  status: "ACTIVE" | "SOON";
}

export default function ClassesPage() {
  const { data } = useQuery({
    queryKey: ["grades"],
    queryFn: () => fetchJson<{ grades: Grade[] }>("/api/grades"),
  });

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title="По классам" />

      <div className="grid grid-cols-3 gap-3">
        {(data?.grades ?? []).map((grade) => {
          const content = (
            <Card className="items-center gap-1 p-4">
              <p className="text-xl font-semibold">{grade.number}</p>
              <p className="text-xs text-muted-foreground">класс</p>
              {grade.status === "SOON" && <span className="text-[10px] text-muted-foreground">Скоро</span>}
            </Card>
          );
          return grade.status === "ACTIVE" ? (
            <Link key={grade.id} href="/topics">
              {content}
            </Link>
          ) : (
            <div key={grade.id} aria-disabled>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
