import { webhookCallback } from "grammy";
import { bot } from "@/bot/bot";

// Вебхук Telegram-бота BioMap (регистрация: /start -> имя -> область).
// Настраивается один раз через scripts/set-webhook.ts после деплоя.
export const POST = webhookCallback(bot, "std/http", {
  secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
});
