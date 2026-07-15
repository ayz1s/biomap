"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  BookOpen,
  LayoutGrid,
  ClipboardCheck,
  Book,
} from "lucide-react";
import { fetchJson } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";

interface HomeSummary {
  continueLesson: { lessonId: string; title: string; currentCardIndex: number; totalCards: number } | null;
  mistakesCount: number;
  dueTodayCount: number;
  overallProgress: number;
}

export default function HomePage() {
  const user = useAppStore((s) => s.user);
  const { data } = useQuery({
    queryKey: ["home"],
    queryFn: () => fetchJson<HomeSummary>("/api/home"),
  });

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-primary">🌱</span> BioMap
        </div>
        <button aria-label="Уведомления" className="text-foreground">
          <Bell size={22} />
        </button>
      </div>

      <div>
        <p className="text-muted-foreground">
          Ассалому алайкум{user?.firstName ? `, ${user.firstName}` : ""}!
        </p>
        <h2 className="text-xl font-semibold">Что изучаем сегодня?</h2>
      </div>

      <Card className="gap-3 p-4">
        {data?.continueLesson ? (
          <>
            <p className="text-sm text-muted-foreground">Продолжить урок</p>
            <p className="font-medium">{data.continueLesson.title}</p>
            <p className="text-sm text-muted-foreground">
              {data.continueLesson.currentCardIndex} из {data.continueLesson.totalCards} карточек
            </p>
            <Link
              href={`/lesson/${data.continueLesson.lessonId}`}
              className="mt-1 flex h-11 items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground"
            >
              Продолжить
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Уроки скоро появятся</p>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Link href="/mistakes">
          <Card className="items-start gap-2 p-3">
            <AlertTriangle size={18} className="text-destructive" />
            <p className="text-xs text-muted-foreground">Мои ошибки</p>
            <p className="text-sm font-medium">{data?.mistakesCount ?? 0} тем</p>
          </Card>
        </Link>
        <Link href="/repetition">
          <Card className="items-start gap-2 p-3">
            <RotateCcw size={18} className="text-primary" />
            <p className="text-xs text-muted-foreground">Повторение</p>
            <p className="text-sm font-medium">На сегодня {data?.dueTodayCount ?? 0}</p>
          </Card>
        </Link>
        <Card className="items-start gap-2 p-3">
          <TrendingUp size={18} className="text-primary" />
          <p className="text-xs text-muted-foreground">Прогресс</p>
          <p className="text-sm font-medium">{data?.overallProgress ?? 0}%</p>
        </Card>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Быстрый доступ</p>
        <div className="grid grid-cols-4 gap-3 text-center">
          <QuickAccessLink href="/topics" icon={BookOpen} label="Темы" />
          <QuickAccessLink href="/classes" icon={LayoutGrid} label="По классам" />
          <QuickAccessLink icon={ClipboardCheck} label="Milliy тесты" soon />
          <QuickAccessLink icon={Book} label="Справочник" soon />
        </div>
      </div>
    </div>
  );
}

function QuickAccessLink({
  href,
  icon: Icon,
  label,
  soon,
}: {
  href?: string;
  icon: typeof BookOpen;
  label: string;
  soon?: boolean;
}) {
  const content = (
    <Card className="items-center gap-2 p-3">
      <Icon size={20} className={soon ? "text-muted-foreground" : "text-primary"} />
      <span className="text-xs leading-tight text-muted-foreground">{label}</span>
      {soon && <span className="text-[10px] text-muted-foreground">Скоро</span>}
    </Card>
  );

  if (soon || !href) return <div aria-disabled>{content}</div>;
  return <Link href={href}>{content}</Link>;
}
