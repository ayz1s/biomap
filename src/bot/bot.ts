import { Bot, InlineKeyboard, Keyboard, type Context } from "grammy";
import type { Language } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { REGIONS, regionLabel, isRegionCode } from "./regions";
import { LANGUAGES, isLanguageCode } from "./languages";
import { BOT_STRINGS } from "./strings";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

export const bot = new Bot(token);

function languageKeyboard() {
  const kb = new InlineKeyboard();
  LANGUAGES.forEach((l) => kb.text(l.label, `language:${l.code}`));
  return kb;
}

function nameConfirmKeyboard(language: Language) {
  const s = BOT_STRINGS[language];
  return new InlineKeyboard().text(s.nameConfirmYes, "confirm_name").text(s.nameConfirmEdit, "edit_name");
}

function regionKeyboard(language: Language) {
  const kb = new InlineKeyboard();
  REGIONS.forEach((r, i) => {
    kb.text(regionLabel(r.code, language), `region:${r.code}`);
    if (i % 2 === 1) kb.row();
  });
  return kb;
}

async function askLanguage(ctx: Context) {
  // Вопрос "на каком языке?" — единственное сообщение бота, которое всегда
  // задаётся до того, как язык вообще известен, поэтому оно не тянется из
  // BOT_STRINGS[language] — язык ещё не выбран.
  await ctx.reply(`${BOT_STRINGS.RU.askLanguage} / ${BOT_STRINGS.UZ.askLanguage}`, {
    reply_markup: languageKeyboard(),
  });
}

async function askNameConfirm(ctx: Context, firstName: string, language: Language) {
  await ctx.reply(BOT_STRINGS[language].nameConfirmQuestion(firstName), {
    parse_mode: "Markdown",
    reply_markup: nameConfirmKeyboard(language),
  });
}

async function askRegion(ctx: Context, language: Language) {
  await ctx.reply(BOT_STRINGS[language].askRegion, { reply_markup: regionKeyboard(language) });
}

// Обычная (не inline) клавиатура с web_app-кнопкой: в отличие от инлайн-кнопки
// в тексте сообщения или мелкой кнопки в меню бота, она закреплена прямо над
// полем ввода и видна всегда — абитуриенту не нужно её искать.
function openAppKeyboard(language: Language) {
  // Фолбэк на известный прод-домен: переменная окружения ещё не добавлена в
  // Vercel (не наш доступ), а без неё кнопка молча пропадала бы — как раз то,
  // что нужно убрать.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biomap-zeta.vercel.app";
  return new Keyboard().webApp(BOT_STRINGS[language].openApp, appUrl).resized().persistent();
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
      registrationStep: "LANGUAGE",
    },
  });

  // Пока язык не выбран (самый первый /start у нового пользователя) —
  // приветствие на русском по умолчанию. Дальше используем сохранённый язык.
  const welcomeLanguage: Language = user.registrationStep === "LANGUAGE" ? "RU" : user.language;
  await ctx.reply(BOT_STRINGS[welcomeLanguage].welcome);

  // Источник истины — region, а не registrationStep: у пользователей, заведённых
  // через Mini App (telegram-auth upsert), step по умолчанию DONE, а region пуст.
  // Ориентируясь только на step, бот считал их зарегистрированными и никогда не
  // спрашивал область.
  if (user.region) {
    await ctx.reply(
      BOT_STRINGS[user.language].alreadyRegistered(user.firstName, regionLabel(user.region, user.language)),
      { reply_markup: openAppKeyboard(user.language) },
    );
    return;
  }

  if (user.registrationStep === "REGION") {
    await askRegion(ctx, user.language);
    return;
  }

  if (user.registrationStep === "LANGUAGE") {
    await askLanguage(ctx);
    return;
  }

  // NAME, AWAITING_NAME_INPUT или унаследованный DONE без region — начинаем/повторяем с подтверждения имени
  await askNameConfirm(ctx, user.firstName, user.language);
});

bot.callbackQuery(/^language:(.+)$/, async (ctx) => {
  const code = ctx.match[1];
  if (!isLanguageCode(code)) {
    await ctx.answerCallbackQuery();
    return;
  }

  const user = await prisma.user.update({
    where: { telegramId: String(ctx.from.id) },
    data: { language: code, registrationStep: "NAME" },
  });
  await ctx.answerCallbackQuery();
  await clearKeyboard(ctx);
  await askNameConfirm(ctx, user.firstName, user.language);
});

bot.callbackQuery("confirm_name", async (ctx) => {
  const user = await prisma.user.update({
    where: { telegramId: String(ctx.from.id) },
    data: { registrationStep: "REGION" },
  });
  await ctx.answerCallbackQuery();
  await clearKeyboard(ctx);
  await askRegion(ctx, user.language);
});

bot.callbackQuery("edit_name", async (ctx) => {
  const user = await prisma.user.update({
    where: { telegramId: String(ctx.from.id) },
    data: { registrationStep: "AWAITING_NAME_INPUT" },
  });
  await ctx.answerCallbackQuery();
  await clearKeyboard(ctx);
  await ctx.reply(BOT_STRINGS[user.language].editNamePrompt);
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

  await ctx.reply(
    BOT_STRINGS[user.language].registrationDone(user.firstName, regionLabel(code, user.language)),
    { reply_markup: openAppKeyboard(user.language) },
  );
});

bot.on("message:text", async (ctx) => {
  const telegramId = String(ctx.from.id);
  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user || user.registrationStep !== "AWAITING_NAME_INPUT") return;

  const newName = ctx.message.text.trim().slice(0, 100);
  if (!newName) return;

  const updated = await prisma.user.update({
    where: { telegramId },
    data: { firstName: newName, registrationStep: "REGION" },
  });
  await ctx.reply(BOT_STRINGS[updated.language].niceToMeetYou(newName));
  await askRegion(ctx, updated.language);
});
