"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { useT } from "@/lib/i18n";

interface ProfileData {
  firstName: string;
  username?: string | null;
  language: "RU" | "UZ";
  currentStreak: number;
  completedLessons: number;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const t = useT();
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchJson<{ user: ProfileData | null }>("/api/profile"),
  });

  const user = data?.user;

  async function changeLanguage(language: "RU" | "UZ") {
    if (!user || user.language === language) return;
    await fetchJson("/api/profile/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    });
    await queryClient.invalidateQueries();
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title={t.nav.profile} />

      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <User size={26} />
        </div>
        <div>
          <p className="text-lg font-semibold">{user?.firstName ?? t.profile.defaultName}</p>
          {user?.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="items-center gap-1 p-4">
          <span className="text-2xl">🔥</span>
          <p className="text-lg font-semibold">{user?.currentStreak ?? 0}</p>
          <p className="text-xs text-muted-foreground">{t.profile.streakDays}</p>
        </Card>
        <Card className="items-center gap-1 p-4">
          <span className="text-2xl">✅</span>
          <p className="text-lg font-semibold">{user?.completedLessons ?? 0}</p>
          <p className="text-xs text-muted-foreground">{t.profile.lessonsDone}</p>
        </Card>
      </div>

      <Card className="gap-2 p-4">
        <p className="text-sm font-medium">{t.profile.language}</p>
        <div className="flex gap-2">
          <button
            onClick={() => changeLanguage("RU")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              user?.language === "RU" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            Русский
          </button>
          <button
            onClick={() => changeLanguage("UZ")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              user?.language === "UZ" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            O'zbekcha
          </button>
        </div>
      </Card>
    </div>
  );
}
