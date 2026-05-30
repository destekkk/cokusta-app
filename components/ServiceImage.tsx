import Image from "next/image";
import { getServiceImage } from "@/lib/data/images";

type Props = {
  slug: string;
  alt: string;
  categorySlug?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  height?: "sm" | "md" | "lg";
};

const heights = {
  sm: "h-36",
  md: "h-48",
  lg: "h-64",
};

export default function ServiceImage({
  slug,
  alt,
  categorySlug,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  height = "sm",
}: Props) {
  const src = getServiceImage(slug, categorySlug);
  const boxClass = `relative w-full overflow-hidden ${heights[height]} ${className}`;

  if (!src) {
    return (
      <div
        className={`${boxClass} flex items-center justify-center bg-gradient-to-br from-secondary via-secondary/90 to-primary/30`}
        aria-label={alt}
      >
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
          Görsel yakında
        </span>
      </div>
    );
  }

  return (
    <div className={boxClass}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-secondary/10 to-transparent" />
    </div>
  );
}
