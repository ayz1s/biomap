import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { recordAnswer } from "@/lib/queries";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId, optionIds } = (await req.json()) as {
    questionId: string;
    optionIds: string[];
  };

  const options = await prisma.questionOption.findMany({ where: { questionId } });
  const selected = options.filter((o) => optionIds.includes(o.id));
  if (selected.length !== optionIds.length) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  const correctIds = new Set(options.filter((o) => o.isCorrect).map((o) => o.id));
  const selectedIds = new Set(optionIds);
  const isCorrect =
    correctIds.size === selectedIds.size && [...correctIds].every((id) => selectedIds.has(id));

  await recordAnswer(userId, questionId, isCorrect);

  const correctOptions = options.filter((o) => o.isCorrect);

  return NextResponse.json({
    correct: isCorrect,
    correctOptions: correctOptions.map((o) => ({ id: o.id, text: o.text })),
  });
}
