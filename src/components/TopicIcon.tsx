import { Microscope, Dna, Footprints, Sprout, User, Globe, Layers, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  microscope: Microscope,
  dna: Dna,
  footprints: Footprints,
  sprout: Sprout,
  user: User,
  globe: Globe,
  layers: Layers,
};

const COLORS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-600",
  teal: "bg-teal-100 text-teal-600",
  emerald: "bg-emerald-100 text-emerald-700",
};

export function TopicIcon({ icon, colorKey }: { icon: string; colorKey: string }) {
  const Icon = ICONS[icon] ?? Sprout;
  const colorClass = COLORS[colorKey] ?? COLORS.green;

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
      <Icon size={20} />
    </div>
  );
}
