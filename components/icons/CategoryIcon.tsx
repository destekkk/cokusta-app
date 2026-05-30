import {
  BookOpen,
  Hammer,
  Paintbrush,
  Settings,
  Sparkles,
  TreePine,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

const categoryIconMap: Record<string, LucideIcon> = {
  tadilat: Hammer,
  nakliyat: Truck,
  temizlik: Sparkles,
  boya: Paintbrush,
  elektrik: Zap,
  tesisat: Wrench,
  tamirat: Settings,
  bahce: TreePine,
  "ozel-ders": BookOpen,
};

type Props = {
  slug: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export default function CategoryIcon({
  slug,
  size = 18,
  className = "",
  strokeWidth = 2,
}: Props) {
  const Icon = categoryIconMap[slug] ?? Hammer;

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}

export function CategoryIconBadge({
  slug,
  size = 16,
  variant = "default",
}: {
  slug: string;
  size?: number;
  variant?: "default" | "light" | "selected";
}) {
  const variants = {
    default: "bg-primary/10 text-primary",
    light: "bg-white/15 text-white",
    selected: "bg-primary text-white",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 ${variants[variant]}`}
    >
      <CategoryIcon slug={slug} size={size} strokeWidth={2.25} />
    </span>
  );
}
