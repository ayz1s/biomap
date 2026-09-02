"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, ClipboardList, LayoutGrid, Leaf, MapPin } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/lib/i18n";

interface HomeSummary {
  continueLesson: {
    lessonId: string;
    title: string;
    currentCardIndex: number;
    totalCards: number;
    gradeNumber: number;
    subject: string | null;
    percent: number;
  } | null;
  mistakesCount: number;
  dueTodayCount: number;
  overallProgress: number;
}

export default function HomePage() {
  const t = useT();
  const { data } = useQuery({
    queryKey: ["home"],
    queryFn: () => fetchJson<HomeSummary>("/api/home"),
  });

  const lesson = data?.continueLesson ?? null;

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <div className="flex items-center gap-1.5 font-heading text-lg font-bold tracking-tight">
        <Leaf size={20} className="text-primary" strokeWidth={2.4} /> BioMap
      </div>

      {lesson ? (
        <Card className="gap-3 p-4">
          <div className="flex items-center gap-1.5 font-heading text-xs font-semibold text-primary-dark">
            <MapPin size={14} strokeWidth={2.4} /> {t.home.youAreHere}
          </div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">{lesson.title}</h2>
          <p className="text-sm text-muted-foreground">
            {t.home.meta(lesson.subject, lesson.gradeNumber, lesson.percent)}
          </p>
          <Progress value={lesson.percent} className="h-1.5" />
          <Link
            href={`/lesson/${lesson.lessonId}`}
            className="mt-1 flex h-11 items-center justify-center rounded-lg bg-primary font-extrabold text-primary-foreground"
          >
            {t.home.continueButton}
          </Link>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">{t.home.noLessonsYet}</p>
      )}

      <Card className="gap-2 p-4">
        <p className="text-sm font-medium text-foreground">{t.home.pathTitle}</p>
        <div className="relative h-2.5 rounded-full bg-locked-soft">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${data?.overallProgress ?? 0}%` }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-primary bg-card shadow-card"
            style={{ left: `${data?.overallProgress ?? 0}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{t.home.pathProgress(data?.overallProgress ?? 0)}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <SectionLink href="/topics" icon={BookOpen} label={t.home.sectionTopics} />
        <SectionLink href="/classes" icon={LayoutGrid} label={t.home.sectionClasses} />
        <SectionLink href="/tests" icon={ClipboardList} label={t.home.sectionTests} />
        <SectionLink href="/mistakes" icon={AlertTriangle} label={t.home.sectionMistakes} />
      </div>
    </div>
  );
}

function SectionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof BookOpen;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card className="items-center gap-2 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
          <Icon size={22} strokeWidth={2.2} />
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </Card>
    </Link>
  );
}
