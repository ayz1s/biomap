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
import { useT } from "@/lib/i18n";

interface HomeSummary {
  continueLesson: { lessonId: string; title: string; currentCardIndex: number; totalCards: number } | null;
  mistakesCount: number;
  dueTodayCount: number;
  overallProgress: number;
}

export default function HomePage() {
  const user = useAppStore((s) => s.user);
  const t = useT();
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
        <button aria-label={t.home.notifications} className="text-foreground">
          <Bell size={22} />
        </button>
      </div>

      <div>
        <p className="text-muted-foreground">{t.home.greeting(user?.firstName)}</p>
        <h2 className="text-2xl font-semibold">{t.home.question}</h2>
      </div>

      <Card className="gap-3 p-4">
        {data?.continueLesson ? (
          <>
            <p className="text-sm text-muted-foreground">{t.home.continueLesson}</p>
            <p className="font-medium">{data.continueLesson.title}</p>
            <p className="text-sm text-muted-foreground">
              {t.home.cardsOf(data.continueLesson.currentCardIndex, data.continueLesson.totalCards)}
            </p>
            <Link
              href={`/lesson/${data.continueLesson.lessonId}`}
              className="mt-1 flex h-11 items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground"
            >
              {t.home.continueButton}
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t.home.noLessonsYet}</p>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Link href="/mistakes">
          <Card className="items-start gap-2 p-3">
            <AlertTriangle size={18} className="text-destructive" />
            <p className="text-xs text-muted-foreground">{t.home.mistakesCard}</p>
            <p className="text-sm font-medium">{t.home.topicsCount(data?.mistakesCount ?? 0)}</p>
          </Card>
        </Link>
        <Link href="/repetition">
          <Card className="items-start gap-2 p-3">
            <RotateCcw size={18} className="text-primary" />
            <p className="text-xs text-muted-foreground">{t.home.repetitionCard}</p>
            <p className="text-sm font-medium">{t.home.dueToday(data?.dueTodayCount ?? 0)}</p>
          </Card>
        </Link>
        <Card className="items-start gap-2 p-3">
          <TrendingUp size={18} className="text-primary" />
          <p className="text-xs text-muted-foreground">{t.home.progressCard}</p>
          <p className="text-sm font-medium">{data?.overallProgress ?? 0}%</p>
        </Card>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t.home.quickAccess}</p>
        <div className="grid grid-cols-4 gap-3 text-center">
          <QuickAccessLink href="/topics" icon={BookOpen} label={t.home.byTopics} />
          <QuickAccessLink href="/classes" icon={LayoutGrid} label={t.home.byClasses} />
          <QuickAccessLink icon={ClipboardCheck} label={t.home.nationalTests} soon soonLabel={t.common.soon} />
          <QuickAccessLink icon={Book} label={t.home.reference} soon soonLabel={t.common.soon} />
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
  soonLabel,
}: {
  href?: string;
  icon: typeof BookOpen;
  label: string;
  soon?: boolean;
  soonLabel?: string;
}) {
  const content = (
    <Card className="items-center gap-2 p-3">
      <Icon size={20} className={soon ? "text-muted-foreground" : "text-primary"} />
      <span className="text-xs leading-tight text-muted-foreground">{label}</span>
      {soon && <span className="text-[10px] text-muted-foreground">{soonLabel}</span>}
    </Card>
  );

  if (soon || !href) return <div aria-disabled>{content}</div>;
  return <Link href={href}>{content}</Link>;
}
