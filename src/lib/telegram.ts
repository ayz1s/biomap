"use client";

export function getTelegramWebApp() {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function initTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (!tg) return null;
  tg.ready();
  tg.expand();
  // Без этого свайп по контенту иногда частично триггерит нативный жест
  // Telegram "свайп вниз/по краю — свернуть/закрыть мини-апп": он чуть
  // сдвигает весь экран (картинку и текст вместе) и отменяется, что выглядит
  // как баг. disableVerticalSwipes() отключает именно этот системный жест,
  // не трогая обычный скролл контента.
  tg.disableVerticalSwipes?.();
  return tg;
}
