// Один раз после деплоя указываем Telegram, куда слать апдейты бота:
//   npx tsx scripts/set-webhook.ts https://<домен-деплоя>/api/bot
// Использует TELEGRAM_BOT_TOKEN и (опционально) TELEGRAM_WEBHOOK_SECRET из .env —
// секрет должен совпадать с тем, что читает src/app/api/bot/route.ts.
import "dotenv/config";
import { Bot } from "grammy";

async function main() {
  const url = process.argv[2];
  if (!url) throw new Error("Укажи URL: npx tsx scripts/set-webhook.ts https://.../api/bot");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN не задан в .env");

  const bot = new Bot(token);
  await bot.api.setWebhook(url, {
    secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
  });

  const info = await bot.api.getWebhookInfo();
  console.log("Webhook установлен:", info);
}

main();
