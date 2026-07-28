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
  Workflow,
  Info,
  X,
  FileText,
  LayoutGrid,
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

interface LessonCardStep {
  order: number;
  text: string;
  context: string | null;
}

interface LessonCard {
  id: string;
  type: CardType;
  title: string | null;
  content: string;
  caption: string | null;
  // Схема (type=ILLUSTRATION), привязанная к другой карточке: не входит в
  // основную последовательность "Далее", показывается по тапу иконки на
  // карточке anchorCardId.
  anchorCardId: string | null;
  steps: LessonCardStep[];
}

interface LessonTextChunk {
  order: number;
  heading: string | null;
  html: string;
}

interface LessonData {
  lesson: { id: string; title: string; cards: LessonCard[]; textChunks: LessonTextChunk[] };
  progress: { currentCardIndex: number } | null;
}

type TabKey = "text" | "schemes" | "cards" | "questions";

const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "text", label: "Текст", icon: FileText },
  { key: "schemes", label: "Схемы", icon: Workflow },
  { key: "cards", label: "Карточки", icon: LayoutGrid },
  { key: "questions", label: "Вопросы", icon: HelpCircle },
];

export default function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => fetchJson<LessonData>(`/api/lessons/${lessonId}`),
  });

  // Дефолт — "Текст": абитуриент должен сначала увидеть настоящий текст
  // параграфа, а не разобранные на карточки куски, чтобы не терять ощущение
  // "я читаю учебник, а не отдельное приложение".
  const [activeTab, setActiveTab] = useState<TabKey>("text");

  if (!data) return null;

  const { title } = data.lesson;

  function selectTab(tab: TabKey) {
    if (tab === "questions") {
      router.push(`/test/${lessonId}`);
      return;
    }
    setActiveTab(tab);
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
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => selectTab(tab.key)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col">
        {activeTab === "text" && <TextTab chunks={data.lesson.textChunks} />}
        {activeTab === "schemes" && <SchemesTab cards={data.lesson.cards} />}
        {activeTab === "cards" && (
          <CardsTab lessonId={lessonId} cards={data.lesson.cards} progress={data.progress} router={router} />
        )}
      </div>
    </div>
  );
}

// ---------- Текст ----------
// Подсветка сделана через глобальный CSS (styled-jsx), т.к. html приходит
// через dangerouslySetInnerHTML и обычные Tailwind-классы внутрь не долетают.
// Разрешены ровно два вида <mark data-k="t"|"r">, оба проверены на бэкенде
// (validateLesson) — сюда долетает только безопасный HTML.
function TextTab({ chunks }: { chunks: LessonTextChunk[] }) {
  if (chunks.length === 0) {
    return (
      <p className="flex-1 self-center pt-12 text-center text-sm text-muted-foreground">
        Текст параграфа для этого урока пока не добавлен.
      </p>
    );
  }

  return (
    <div className="lesson-text flex flex-col gap-4 pb-4">
      {chunks.map((chunk, i) => (
        <div key={i} className="flex flex-col gap-1">
          {chunk.heading && <p className="font-semibold">{chunk.heading}</p>}
          <p className="whitespace-pre-line break-words leading-relaxed" dangerouslySetInnerHTML={{ __html: chunk.html }} />
        </div>
      ))}
      <style jsx global>{`
        .lesson-text mark[data-k="t"] {
          background: none;
          color: var(--color-primary, #2563eb);
          font-weight: 600;
        }
        .lesson-text mark[data-k="r"] {
          background: rgba(217, 119, 6, 0.15);
          color: inherit;
          font-weight: 600;
          border-radius: 3px;
          padding: 0 2px;
        }
      `}</style>
    </div>
  );
}

// ---------- Схемы ----------
// Все схемы урока подряд (и привязанные к карточке, и нет) — отдельный
// полный список, независимо от того, показываются ли они ещё и иконкой
// на карточке-первоисточнике во вкладке "Карточки".
function SchemesTab({ cards }: { cards: LessonCard[] }) {
  const schemes = cards.filter((c) => c.type === "ILLUSTRATION");

  if (schemes.length === 0) {
    return (
      <p className="flex-1 self-center pt-12 text-center text-sm text-muted-foreground">
        Схем для этого урока пока нет.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      {schemes.map((scheme) => (
        <div key={scheme.id} className="flex flex-col gap-2 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          {scheme.title && <p className="text-sm font-medium">{scheme.title}</p>}
          <SchemeChain card={scheme} />
        </div>
      ))}
    </div>
  );
}

// ---------- Карточки ----------
// Прежняя логика тап-степпера/якорных схем — без изменений, просто
// вынесена в отдельный саб-компонент вкладки. Прогресс (currentCardIndex)
// относится только к этой вкладке.
function CardsTab({
  lessonId,
  cards,
  progress,
  router,
}: {
  lessonId: string;
  cards: LessonCard[];
  progress: { currentCardIndex: number } | null;
  router: ReturnType<typeof useRouter>;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (progress?.currentCardIndex) setIndex(progress.currentCardIndex);
  }, [progress?.currentCardIndex]);

  // Схемы, привязанные к другой карточке, не идут отдельным экраном — они
  // показываются иконкой прямо на карточке-первоисточнике (см. anchorCardId).
  const mainCards = cards.filter((c) => !c.anchorCardId);
  const anchoredSchemeByCardId = new Map(
    cards.filter((c) => c.anchorCardId).map((c) => [c.anchorCardId as string, c]),
  );

  const card = mainCards[index];
  const isLast = index === mainCards.length - 1;
  const anchoredScheme = anchoredSchemeByCardId.get(card.id) ?? null;

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
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 items-center">
        {/* key=card.id — под-шаг/контекст/оверлей схемы сбрасываются сами
            при переходе на другую карточку, без ручных эффектов сброса. */}
        <LessonCardView key={card.id} card={card} anchoredScheme={anchoredScheme} />
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
          {index + 1} / {mainCards.length}
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
function SchemeChain({ card }: { card: LessonCard }) {
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

function LessonCardView({ card, anchoredScheme }: { card: LessonCard; anchoredScheme: LessonCard | null }) {
  const [schemeOpen, setSchemeOpen] = useState(false);

  if (card.type === "ILLUSTRATION") {
    return <SchemeChain card={card} />;
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

  return (
    <div className="flex w-full flex-col gap-2">
      {card.steps.length > 0 ? (
        <StepperCard icon={icon} className={className} card={card} />
      ) : (
        <PlainCard icon={icon} className={className} card={card} />
      )}

      {anchoredScheme && (
        <button
          onClick={() => setSchemeOpen(true)}
          aria-label="Показать схему"
          className="flex w-fit items-center gap-1 self-end rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
        >
          <Workflow size={14} /> Схема
        </button>
      )}

      {schemeOpen && anchoredScheme && (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl bg-foreground/40 p-4">
          <div className="w-full rounded-2xl bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">{anchoredScheme.title}</p>
              <button onClick={() => setSchemeOpen(false)} aria-label="Закрыть">
                <X size={18} />
              </button>
            </div>
            <SchemeChain card={anchoredScheme} />
          </div>
        </div>
      )}
    </div>
  );
}

// Карточка со steps: тап по карточке листает шаги один за другим (короткий
// текст сразу, "из учебника" — контекст по кнопке, свёрнут по умолчанию).
// Общее "Далее" между карточками урока при этом не трогается — это
// дополнительный уровень навигации внутри одной карточки, а не замена.
function StepperCard({
  icon: Icon,
  className,
  card,
}: {
  icon: typeof Lightbulb;
  className: string;
  card: LessonCard;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [ctxOpen, setCtxOpen] = useState(false);
  const step = card.steps[stepIndex];
  const isLastStep = stepIndex === card.steps.length - 1;

  return (
    <div
      className={`flex w-full flex-col gap-3 rounded-2xl p-5 ${className}`}
      onClick={() => {
        if (!isLastStep) {
          setStepIndex(stepIndex + 1);
          setCtxOpen(false);
        }
      }}
    >
      <div className="flex items-center justify-between">
        <Icon size={22} />
        <div className="flex gap-1">
          {card.steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full ${i === stepIndex ? "w-4 bg-primary" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
      </div>
      {card.title && <p className="font-semibold">{card.title}</p>}
      <p className="whitespace-pre-line break-words leading-relaxed">{step.text}</p>

      {step.context && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCtxOpen(!ctxOpen);
            }}
            className="flex w-fit items-center gap-1 rounded-full bg-background px-3 py-1 text-xs text-muted-foreground"
          >
            <Info size={13} /> из учебника
          </button>
          {ctxOpen && <p className="text-sm text-muted-foreground leading-relaxed">{step.context}</p>}
        </>
      )}

      {!isLastStep && (
        <p className="text-center text-xs text-muted-foreground">тапни карточку — следующий</p>
      )}
    </div>
  );
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
