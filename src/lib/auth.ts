import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

// Проверка подписи Telegram WebApp initData — без этого кто угодно может
// притвориться другим пользователем, отправив поддельный initData на сервер.
// Алгоритм: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export function validateTelegramInitData(
  initData: string,
  botToken: string,
): { valid: boolean; user?: TelegramUser } {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { valid: false };
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) return { valid: false };

  const userJson = params.get("user");
  const user = userJson ? (JSON.parse(userJson) as TelegramUser) : undefined;
  return { valid: true, user };
}
