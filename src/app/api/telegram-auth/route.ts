import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateTelegramInitData } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";

function withSessionCookie(response: NextResponse, userId: string) {
  response.cookies.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function POST(req: NextRequest) {
  const { initData } = (await req.json()) as { initData?: string };
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const result = validateTelegramInitData(initData ?? "", botToken);

  // Вне Telegram (обычный браузер при локальной разработке) initData пустой —
  // разрешаем тестового пользователя только вне продакшена.
  if (!result.valid || !result.user) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Invalid initData" }, { status: 401 });
    }
    const devUser = await prisma.user.upsert({
      where: { telegramId: "dev-local" },
      update: {},
      create: { telegramId: "dev-local", firstName: "Тестер" },
    });
    return withSessionCookie(NextResponse.json({ user: devUser }), devUser.id);
  }

  const user = await prisma.user.upsert({
    where: { telegramId: String(result.user.id) },
    update: { firstName: result.user.first_name, username: result.user.username },
    create: {
      telegramId: String(result.user.id),
      firstName: result.user.first_name,
      username: result.user.username,
    },
  });

  return withSessionCookie(NextResponse.json({ user }), user.id);
}
