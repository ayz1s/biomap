import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { recordAnswer } from "@/lib/queries";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId, optionId } = (await req.json()) as {
    questionId: string;
    optionId: string;
  };

  const option = await prisma.questionOption.findUnique({ where: { id: optionId } });
  if (!option || option.questionId !== questionId) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  await recordAnswer(userId, questionId, option.isCorrect);

  const correctOption = option.isCorrect
    ? option
    : await prisma.questionOption.findFirst({ where: { questionId, isCorrect: true } });

  return NextResponse.json({
    correct: option.isCorrect,
    correctOption: correctOption && { id: correctOption.id, text: correctOption.text },
  });
}
