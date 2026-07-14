"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Link2,
  AlertTriangle,
  HelpCircle,
  ClipboardCheck,
} from "lucide-react";
import { fetchJson } from "@/lib/api";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface HintItem {
  level: number;
  text: string;
}

interface QuestionData {
  id: string;
  kind: "MINI" | "MILLIY";
  text: string;
  note: string | null;
  options: Option[];
  hints: HintItem[];
}

interface MicroLessonDetail {
  lesson: {
    id: string;
    grade: number;
    order: number;
    file: string;
    title: string;
    suit: string;
    scheme: string;
    connections: string;
    commonMistake: string;
    questions: QuestionData[];
  };
  prevOrder: number | null;
  nextOrder: number | null;
}

export default function MicroLessonDetailPage({
  params,
}: {
  params: Promise<{ grade: string; order: string }>;
}) {
  const { grade, order } = use(params);
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["microlesson", grade, order],
    queryFn: () => fetchJson<MicroLessonDetail>(`/api/microlessons/${grade}/${order}`),
  });

  if (!data) return null;

  const { lesson, prevOrder, nextOrder } = data;
  const miniQuestion = lesson.questions.find((q) => q.kind === "MINI");
  const milliyQuestion = lesson.questions.find((q) => q.kind === "MILLIY");

  return (
    <div className="flex min-h-full flex-col gap-4 px-4 pt-4 pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Назад"
          className="flex h-9 w-9 shrink-0 items-center justify-center"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            {lesson.grade} класс · §{lesson.order}
          </p>
          <h1 className="truncate text-lg font-semibold">{lesson.title}</h1>
        </div>
      </div>

      <Section icon={Lightbulb} title="Суть" text={lesson.suit} className="bg-card ring-1 ring-foreground/10" />
      <Section
        icon={Lightbulb}
        title="Схема"
        text={lesson.scheme}
        className="bg-secondary text-secondary-foreground"
      />
      <Section
        icon={Link2}
        title="Связь с другими темами"
        text={lesson.connections}
        className="bg-card ring-1 ring-foreground/10"
      />
      <Section
        icon={AlertTriangle}
        title="Частая ошибка"
        text={lesson.commonMistake}
        className="bg-amber-50 text-amber-900"
      />

      {miniQuestion && <MiniQuestionBlock question={miniQuestion} />}
      {milliyQuestion && <MilliyQuestionBlock question={milliyQuestion} />}

      <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
        {prevOrder ? (
          <Link
            href={`/microlessons/${grade}/${prevOrder}`}
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            <ArrowLeft size={16} /> §{prevOrder}
          </Link>
        ) : (
          <span />
        )}
        {nextOrder ? (
          <Link
            href={`/microlessons/${grade}/${nextOrder}`}
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            §{nextOrder} <ArrowRight size={16} />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  text,
  className,
}: {
  icon: typeof Lightbulb;
  title: string;
  text: string;
  className: string;
}) {
  return (
    <div className={`flex flex-col gap-2 rounded-2xl p-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon size={18} /> {title}
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function optionStateClass(opt: Option, selectedId: string | null, revealed: boolean) {
  if (!revealed) {
    return opt.id === selectedId ? "border-primary bg-secondary" : "border-border bg-card";
  }
  if (opt.isCorrect) return "border-emerald-500 bg-emerald-50 text-emerald-900";
  if (opt.id === selectedId) return "border-destructive bg-destructive/10 text-destructive";
  return "border-border bg-card opacity-60";
}

function MiniQuestionBlock({ question }: { question: QuestionData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = question.options.find((o) => o.id === selectedId) ?? null;
  const revealed = selectedId !== null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <HelpCircle size={18} /> Мини-вопрос
      </div>
      <p className="font-medium">{question.text}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedId(opt.id)}
            disabled={revealed}
            className={`rounded-xl border px-4 py-3 text-left text-sm ${optionStateClass(opt, selectedId, revealed)}`}
          >
            {opt.text}
          </button>
        ))}
      </div>
      {selected && (
        <p className={`text-sm font-medium ${selected.isCorrect ? "text-emerald-600" : "text-destructive"}`}>
          {selected.isCorrect ? "Верно!" : "Неверно. Правильный ответ выделен зелёным."}
        </p>
      )}
    </div>
  );
}

function MilliyQuestionBlock({ question }: { question: QuestionData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [answered, setAnswered] = useState(false);

  const selected = question.options.find((o) => o.id === selectedId) ?? null;
  const isCorrect = selected?.isCorrect ?? false;
  const sortedHints = [...question.hints].sort((a, b) => a.level - b.level);

  function reset() {
    setSelectedId(null);
    setAnswered(false);
    setHintsShown(0);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <ClipboardCheck size={18} /> Milliy-вопрос
      </div>
      <p className="font-medium">{question.text}</p>

      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => !answered && setSelectedId(opt.id)}
            disabled={answered}
            className={`rounded-xl border px-4 py-3 text-left text-sm ${optionStateClass(opt, selectedId, answered)}`}
          >
            {opt.text}
          </button>
        ))}
      </div>

      {!answered && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setHintsShown((h) => Math.min(h + 1, sortedHints.length))}
            disabled={hintsShown >= sortedHints.length}
            className="flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-40"
          >
            <Lightbulb size={16} /> Подсказка ({hintsShown}/{sortedHints.length})
          </button>
          <button
            onClick={() => setAnswered(true)}
            disabled={!selectedId}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
          >
            Ответить
          </button>
        </div>
      )}

      {hintsShown > 0 && !answered && (
        <div className="flex flex-col gap-1 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
          {sortedHints.slice(0, hintsShown).map((h) => (
            <p key={h.level}>
              {h.level}. {h.text}
            </p>
          ))}
        </div>
      )}

      {answered && (
        <div className="flex flex-col gap-2">
          <p className={`text-sm font-medium ${isCorrect ? "text-emerald-600" : "text-destructive"}`}>
            {isCorrect ? "Верно!" : "Неверно."}
          </p>
          {question.note && (
            <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">{question.note}</p>
          )}
          <button onClick={reset} className="self-start text-sm text-primary">
            Пройти ещё раз
          </button>
        </div>
      )}
    </div>
  );
}
