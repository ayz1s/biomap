import { BottomNav } from "@/components/layout/BottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex-1 pb-4">{children}</div>
      <BottomNav />
    </div>
  );
}
