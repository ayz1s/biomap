import { Bot, InlineKeyboard, type Context } from "grammy";
import { prisma } from "@/lib/prisma";
import { REGIONS, regionLabel, isRegionCode } from "./regions";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

export const bot = new Bot(token);

const WELCOME = `Привет! Я — бот BioMap 🌱

Помогаю абитуриентам готовиться по биологии: собираю темы школьной программы в единую систему, объясняю их простыми микроуроками и слежу за твоим прогрессом — с 5 по 11 класс.

Сначала давай зарегистрируемся — это займёт полминуты.`;

function nameConfirmKeyboard() {
  return new InlineKeyboard().text("✅ Да, всё верно", "confirm_name").text("✏️ Изменить", "edit_name");
}

function regionKeyboard() {
  const kb = new InlineKeyboard();
  REGIONS.forEach((r, i) => {
    kb.text(r.label, `region:${r.code}`);
    if (i % 2 === 1) kb.row();
  });
  return kb;
}

async function askNameConfirm(ctx: Context, firstName: string) {
  await ctx.reply(`Тебя зовут *${firstName}* — всё верно?`, {
    parse_mode: "Markdown",
    reply_markup: nameConfirmKeyboard(),
  });
}

async function askRegion(ctx: Context) {
  await ctx.reply("Из какой ты области?", { reply_markup: regionKeyboard() });
}

// Кнопки на уже отправленном сообщении убираем best-effort: сообщение могло
// устареть (> 48ч) или уже быть отредактировано — это не должно ронять хендлер.
async function clearKeyboard(ctx: Context) {
  try {
    await ctx.editMessageReplyMarkup();
  } catch {
    // не критично
  }
}

bot.command("start", async (ctx) => {
  const tgUser = ctx.from;
  if (!tgUser) return;

  const user = await prisma.user.upsert({
    where: { telegramId: String(tgUser.id) },
    update: {},
    create: {
      telegramId: String(tgUser.id),
      firstName: tgUser.first_name,
      username: tgUser.username,
      registrationStep: "NAME",
    },
  });

  await ctx.reply(WELCOME);

  if (user.registrationStep === "DONE") {
    await ctx.reply(
      `Ты уже зарегистрирован(а) 🙌\n👤 Имя: ${user.firstName}\n📍 Область: ${
        user.region ? regionLabel(user.region) : "—"
      }`,
    );
    return;
  }

  if (user.registrationStep === "REGION") {
    await askRegion(ctx);
    return;
  }

  // NAME или AWAITING_NAME_INPUT — в обоих случаях начинаем/повторяем с подтверждения имени
  await askNameConfirm(ctx, user.firstName);
});

bot.callbackQuery("confirm_name", async (ctx) => {
  await prisma.user.update({
    where: { telegramId: String(ctx.from.id) },
    data: { registrationStep: "REGION" },
  });
  await ctx.answerCallbackQuery();
  await clearKeyboard(ctx);
  await askRegion(ctx);
});

bot.callbackQuery("edit_name", async (ctx) => {
  await prisma.user.update({
    where: { telegramId: String(ctx.from.id) },
    data: { registrationStep: "AWAITING_NAME_INPUT" },
  });
  await ctx.answerCallbackQuery();
  await clearKeyboard(ctx);
  await ctx.reply("Хорошо, напиши, как к тебе обращаться:");
});

bot.callbackQuery(/^region:(.+)$/, async (ctx) => {
  const code = ctx.match[1];
  if (!isRegionCode(code)) {
    await ctx.answerCallbackQuery();
    return;
  }

  const user = await prisma.user.update({
    where: { telegramId: String(ctx.from.id) },
    data: { region: code, registrationStep: "DONE" },
  });
  await ctx.answerCallbackQuery();
  await clearKeyboard(ctx);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  await ctx.reply(
    `Регистрация завершена ✅\n\n👤 Имя: ${user.firstName}\n📍 Область: ${regionLabel(
      code,
    )}\n\nМожно начинать готовиться!`,
    appUrl ? { reply_markup: new InlineKeyboard().webApp("🚀 Открыть BioMap", appUrl) } : undefined,
  );
});

bot.on("message:text", async (ctx) => {
  const telegramId = String(ctx.from.id);
  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user || user.registrationStep !== "AWAITING_NAME_INPUT") return;

  const newName = ctx.message.text.trim().slice(0, 100);
  if (!newName) return;

  await prisma.user.update({
    where: { telegramId },
    data: { firstName: newName, registrationStep: "REGION" },
  });
  await ctx.reply(`Приятно познакомиться, ${newName}!`);
  await askRegion(ctx);
});
