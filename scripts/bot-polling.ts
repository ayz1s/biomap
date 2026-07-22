// Локальный запуск бота через long polling — для разработки без публичного URL:
//   npx tsx scripts/bot-polling.ts
//
// ВАЖНО: long polling и webhook не могут работать одновременно — Telegram шлёт
// апдейты только одним способом. Если для этого бота уже настроен продовый
// webhook (see scripts/set-webhook.ts), polling его временно отключит и заберёт
// себе все реальные апдейты. Не запускай это против боевого токена, пока не
// уверен, что сейчас это безопасно. bot.ts также пишет напрямую в общую (боевую)
// базу — заводя тестового пользователя здесь, ты создашь реальную строку в User.
import "dotenv/config";
import { bot } from "../src/bot/bot";

async function main() {
  await bot.api.deleteWebhook();
  console.log("Webhook снят, запускаю long polling...");
  bot.start({
    onStart: (info) => console.log(`Бот @${info.username} слушает апдейты (Ctrl+C — остановить)`),
  });
}

main();
