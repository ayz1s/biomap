import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { streak: true },
  });
  const completedLessons = await prisma.userLessonProgress.count({
    where: { userId, completed: true },
  });

  return NextResponse.json({
    user: user && {
      firstName: user.firstName,
      username: user.username,
      currentStreak: user.streak?.currentStreak ?? 0,
      completedLessons,
    },
  });
}
