import {
  Microscope,
  Dna,
  Footprints,
  Sprout,
  User,
  Globe,
  Layers,
  FlaskConical,
  PawPrint,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  microscope: Microscope,
  dna: Dna,
  footprints: Footprints,
  sprout: Sprout,
  user: User,
  globe: Globe,
  layers: Layers,
  "flask-conical": FlaskConical,
  "paw-print": PawPrint,
};

const COLORS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300/70",
  purple: "bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-300/70",
  amber: "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-300/70",
  green: "bg-green-100 text-green-700 ring-1 ring-inset ring-green-300/70",
  red: "bg-red-100 text-red-700 ring-1 ring-inset ring-red-300/70",
  teal: "bg-teal-100 text-teal-700 ring-1 ring-inset ring-teal-300/70",
  emerald: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-300/70",
  orange: "bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300/70",
  rose: "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-300/70",
};

export function TopicIcon({ icon, colorKey }: { icon: string; colorKey: string }) {
  const Icon = ICONS[icon] ?? Sprout;
  const colorClass = COLORS[colorKey] ?? COLORS.green;

  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
      <Icon size={22} strokeWidth={2.25} />
    </div>
  );
}
