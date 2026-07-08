"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initTelegramWebApp } from "@/lib/telegram";
import { useAppStore } from "@/store/useAppStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    const tg = initTelegramWebApp();
    fetch("/api/telegram-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg?.initData ?? "" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [setUser]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
