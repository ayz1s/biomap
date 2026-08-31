"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getTelegramWebApp } from "@/lib/telegram";

// Корневые вкладки нижней навигации — с них некуда возвращаться "назад"
// внутри приложения, поэтому нативная BackButton на них скрыта (и виден
// обычный крестик Telegram — на этих экранах закрыть приложение уместно).
const ROOT_PATHS = new Set(["/", "/topics", "/tests", "/repetition", "/profile"]);

// На остальных экранах показываем нативную стрелку "назад" Telegram вместо
// крестика — раньше пользователь по привычке жал на крестик (он не видел
// свою кнопку "назад" при скролле) и полностью закрывал мини-апп.
export function TelegramBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const tg = getTelegramWebApp();
    const backButton = tg?.BackButton;
    if (!backButton) return;

    const handleClick = () => router.back();

    if (ROOT_PATHS.has(pathname)) {
      backButton.hide();
    } else {
      backButton.show();
      backButton.onClick(handleClick);
    }

    return () => {
      backButton.offClick(handleClick);
    };
  }, [pathname, router]);

  return null;
}
