"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  Link2,
  HelpCircle,
  BookOpen,
  ListChecks,
} from "lucide-react";
import { fetchJson } from "@/lib/api";

type CardType =
  | "MAIN_IDEA"
  | "EXPLANATION"
  | "ILLUSTRATION"
  | "CONNECTION"
  | "COMMON_MISTAKE"
  | "MINI_QUESTION"
  | "KEY_TERMS"
  | "SUMMARY";

interface LessonCard {
  id: string;
  type: CardType;
  title: string | null;
  content: string;
  caption: string | null;
}

interface LessonData {
  lesson: { id: string; title: string; cards: LessonCard[] };
  progress: { currentCardIndex: number } | null;
}

const TABS: { types: CardType[]; label: string }[] = [
  { types: ["MAIN_IDEA", "EXPLANATION", "CONNECTION", "COMMON_MISTAKE", "KEY_TERMS", "SUMMARY"], label: "Теория" },
  { types: ["ILLUSTRATION"], label: "Схемы" },
  { types: ["MINI_QUESTION"], label: "Вопросы" },
];

export default function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => fetchJson<LessonData>(`/api/lessons/${lessonId}`),
  });

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (data?.progress?.currentCardIndex) setIndex(data.progress.currentCardIndex);
  }, [data?.progress?.currentCardIndex]);

  if (!data) return null;

  const { cards, title } = data.lesson;
  const card = cards[index];
  const isLast = index === cards.length - 1;
  const activeTabLabel = TABS.find((t) => t.types.includes(card.type))?.label;

  function saveProgress(next: { currentCardIndex?: number; completed?: boolean }) {
    fetchJson(`/api/lessons/${lessonId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => {});
  }

  function goNext() {
    if (isLast) {
      saveProgress({ completed: true });
      router.push(`/test/${lessonId}`);
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    saveProgress({ currentCardIndex: nextIndex });
  }

  function goBack() {
    if (index === 0) return;
    setIndex(index - 1);
  }

  return (
    <div className="flex min-h-full flex-col gap-4 px-4 pt-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Назад" className="flex h-9 w-9 items-center justify-center">
          <ArrowLeft size={22} />
        </button>
        <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <span
            key={tab.label}
            className={`rounded-full px-3 py-1 text-sm ${
              activeTabLabel === tab.label
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {tab.label}
          </span>
        ))}
      </div>

      <div className="flex flex-1 items-center">
        <LessonCardView card={card} />
      </div>

      <div className="flex items-center justify-between pb-4">
        <button
          onClick={goBack}
          disabled={index === 0}
          className="flex items-center gap-1 text-muted-foreground disabled:opacity-30"
        >
          <ArrowLeft size={18} /> Назад
        </button>
        <span className="text-sm text-muted-foreground">
          {index + 1} / {cards.length}
        </span>
        <button onClick={goNext} className="flex items-center gap-1 font-medium text-primary">
          {isLast ? "Начать тест" : "Далее"} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// Каждый " → "-сегмент схемы — свой блок в цепочке. Короткие узлы (как в
// "Корень → Стебель → Лист") получаются компактными пилюлями по центру;
// плотные конспект-сегменты в скобках/с предложениями просто переносятся
// по словам внутри своего блока, а не обрезаются за краем экрана.
const SHORT_NODE_LENGTH = 40;

// Каждый " → "-сегмент — свой шаг цепочки; внутри шага " | " означает
// параллельные, а не последовательные узлы (ветвление), и рендерится рядом,
// а не как сырой символ "|" на экране.
function LessonCardView({ card }: { card: LessonCard }) {
  if (card.type === "ILLUSTRATION") {
    const steps = card.content
      .split(" → ")
      .map((s) => s.trim())
      .filter(Boolean);

    return (
      <div className="flex w-full flex-col items-center gap-2">
        {steps.map((step, i) => {
          const branches = step
            .split(" | ")
            .map((b) => b.trim())
            .filter(Boolean);
          const isParallel = branches.length > 1;
          return (
            <div key={i} className="flex w-full flex-col items-center gap-2">
              {isParallel ? (
                <div className="flex w-full flex-wrap justify-center gap-2">
                  {branches.map((branch, j) => {
                    const isShort = branch.length <= SHORT_NODE_LENGTH;
                    return (
                      <div
                        key={j}
                        className={`max-w-[45%] break-words rounded-xl bg-secondary px-4 py-2 text-secondary-foreground ${
                          isShort ? "text-center font-medium" : "text-left leading-relaxed"
                        }`}
                      >
                        {branch}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className={`max-w-[90%] break-words rounded-xl bg-secondary px-4 py-2 text-secondary-foreground ${
                    step.length <= SHORT_NODE_LENGTH ? "text-center font-medium" : "text-left leading-relaxed"
                  }`}
                >
                  {step}
                </div>
              )}
              {i < steps.length - 1 && <div className="h-6 w-px bg-border" />}
            </div>
          );
        })}
        {card.caption && (
          <p className="mt-2 max-w-[95%] whitespace-pre-line break-words text-center text-sm text-muted-foreground">
            {card.caption}
          </p>
        )}
      </div>
    );
  }

  const style: Record<Exclude<CardType, "ILLUSTRATION">, { icon: typeof Lightbulb; className: string }> = {
    MAIN_IDEA: { icon: Lightbulb, className: "bg-secondary text-secondary-foreground" },
    EXPLANATION: { icon: Lightbulb, className: "bg-card text-card-foreground ring-1 ring-foreground/15" },
    CONNECTION: { icon: Link2, className: "bg-secondary text-secondary-foreground" },
    COMMON_MISTAKE: { icon: AlertTriangle, className: "bg-amber-50 text-amber-900" },
    MINI_QUESTION: { icon: HelpCircle, className: "bg-card text-card-foreground ring-1 ring-foreground/15" },
    KEY_TERMS: { icon: BookOpen, className: "bg-card text-card-foreground ring-1 ring-foreground/15" },
    SUMMARY: { icon: ListChecks, className: "bg-secondary text-secondary-foreground" },
  };
  const { icon, className } = style[card.type];

  return <PlainCard icon={icon} className={className} card={card} />;
}

function PlainCard({
  icon: Icon,
  className,
  card,
}: {
  icon: typeof Lightbulb;
  className: string;
  card: LessonCard;
}) {
  return (
    <div className={`flex w-full flex-col gap-3 rounded-2xl p-5 ${className}`}>
      <Icon size={22} />
      {card.title && <p className="font-semibold">{card.title}</p>}
      <p className="whitespace-pre-line break-words leading-relaxed">{card.content}</p>
    </div>
  );
}
