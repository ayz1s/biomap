import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const grades = await prisma.grade.findMany({
    where: { language: "RU" },
    orderBy: { number: "asc" },
  });
  return NextResponse.json({ grades });
}
