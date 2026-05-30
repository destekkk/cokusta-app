import Image from "next/image";
import Link from "next/link";
import { getCategoryImage } from "@/lib/data/images";
import type { Category } from "@/lib/types";

type Props = {
  category: Category;
};

export default function CategoryCard({ category }: Props) {
  const imageSrc = getCategoryImage(category.slug);

  return (
    <Link
      href={`/kategori/${category.slug}`}
      className="group overflow-hidden border border-border bg-card transition-all hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative h-40 w-full overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/90 to-primary/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/30 to-transparent" />
        <h3 className="absolute bottom-4 left-4 text-lg font-semibold text-white">
          {category.name}
        </h3>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground">{category.description}</p>
        <span className="mt-2 inline-block text-sm font-medium text-primary">
          Teklif Al →
        </span>
      </div>
    </Link>
  );
}
