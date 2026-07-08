"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface ProfileData {
  firstName: string;
  username?: string | null;
  currentStreak: number;
  completedLessons: number;
}

export default function ProfilePage() {
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchJson<{ user: ProfileData | null }>("/api/profile"),
  });

  const user = data?.user;

  return (
    <div className="flex flex-col gap-4 px-4">
      <ScreenHeader title="Профиль" />

      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <User size={26} />
        </div>
        <div>
          <p className="text-lg font-semibold">{user?.firstName ?? "Ученик"}</p>
          {user?.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="items-center gap-1 p-4">
          <span className="text-2xl">🔥</span>
          <p className="text-lg font-semibold">{user?.currentStreak ?? 0}</p>
          <p className="text-xs text-muted-foreground">дней подряд</p>
        </Card>
        <Card className="items-center gap-1 p-4">
          <span className="text-2xl">✅</span>
          <p className="text-lg font-semibold">{user?.completedLessons ?? 0}</p>
          <p className="text-xs text-muted-foreground">уроков пройдено</p>
        </Card>
      </div>
    </div>
  );
}
