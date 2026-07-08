"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

interface Option {
  id: string;
  text: string;
  order: number;
}
interface Hint {
  order: number;
  text: string;
}
interface Question {
  id: string;
  text: string;
  options: Option[];
  hints: Hint[];
}
interface LessonData {
  lesson: { id: string; title: string; questions: Question[] };
}

type Mode = "question" | "hint" | "explanation" | "correct";

export default function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId: lessonId } = use(params);
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => fetchJson<LessonData>(`/api/lessons/${lessonId}`),
  });

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("question");
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [correctOptionText, setCorrectOptionText] = useState<string | null>(null);

  if (!data) return null;
  const questions = data.lesson.questions;
  const question = questions[qIndex];

  if (finished) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-xl font-semibold">Тест завершён!</p>
        <p className="text-muted-foreground">
          Правильно: {correctCount} из {questions.length}
        </p>
        <Link
          href="/"
          className="flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground"
        >
          На главную
        </Link>
      </div>
    );
  }

  async function submit() {
    if (!selected) return;
    const { correct, correctOption } = await fetchJson<{
      correct: boolean;
      correctOption?: { id: string; text: string };
    }>(`/api/lessons/${lessonId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, optionId: selected }),
    });

    if (correct) {
      setCorrectCount((c) => c + 1);
      setMode("correct");
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (nextAttempts > question.hints.length) {
      setCorrectOptionText(correctOption?.text ?? null);
      setMode("explanation");
    } else {
      setMode("hint");
    }
  }

  async function goToNextQuestion() {
    if (qIndex === questions.length - 1) {
      await fetchJson(`/api/lessons/${lessonId}/complete-test`, { method: "POST" });
      setFinished(true);
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setAttempts(0);
    setCorrectOptionText(null);
    setMode("question");
  }

  return (
    <div className="flex min-h-full flex-col gap-4 px-4 pt-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Назад" className="flex h-9 w-9 items-center justify-center">
          <ArrowLeft size={22} />
        </button>
        <h1 className="flex-1 truncate text-lg font-semibold">{data.lesson.title}</h1>
      </div>

      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          Вопрос {qIndex + 1} из {questions.length}
        </p>
        <Progress value={((qIndex + 1) / questions.length) * 100} className="h-1.5" />
      </div>

      {mode === "question" && (
        <>
          <p className="text-lg font-medium">{question.text}</p>
          <div className="flex flex-col gap-2">
            {question.options.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left ${
                  selected === opt.id
                    ? "border-primary bg-secondary"
                    : "border-border bg-card"
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + i)}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between pb-4">
            <button onClick={goToNextQuestion} className="text-muted-foreground">
              Пропустить
            </button>
            <button
              onClick={submit}
              disabled={!selected}
              className="flex h-11 items-center rounded-xl bg-primary px-6 font-medium text-primary-foreground disabled:opacity-40"
            >
              Ответить
            </button>
          </div>
        </>
      )}

      {mode === "correct" && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-secondary p-4 text-secondary-foreground">
            <Check size={20} /> Верно!
          </div>
          <button
            onClick={goToNextQuestion}
            className="mt-auto mb-4 flex h-11 items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground"
          >
            Далее
          </button>
        </div>
      )}

      {mode === "hint" && (
        <div className="flex flex-1 flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Подсказка {attempts} из {question.hints.length}
          </p>
          <p className="text-lg">{question.hints[attempts - 1]?.text}</p>
          <button
            onClick={() => setMode("question")}
            className="mt-auto mb-4 flex h-11 items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground"
          >
            Пробовать снова
          </button>
        </div>
      )}

      {mode === "explanation" && (
        <div className="flex flex-1 flex-col gap-4">
          <p className="font-medium">Правильный ответ:</p>
          <p className="text-lg">{correctOptionText}</p>
          <button
            onClick={goToNextQuestion}
            className="mt-auto mb-4 flex h-11 items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground"
          >
            Далее
          </button>
        </div>
      )}
    </div>
  );
}
