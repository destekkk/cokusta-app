"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import type { Review } from "@/lib/data/reviews";

type Props = {
  reviews: Review[];
};

const INTERVAL_MS = 6000;
const GAP_PX = 20;

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full flex-col border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {review.initials}
      </div>

      <div className="mt-4 flex gap-0.5">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-primary text-primary" />
        ))}
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="mt-4 border-t border-border pt-4">
        <div className="font-semibold text-foreground">{review.name}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {review.city} · {review.service}
        </div>
      </div>
    </article>
  );
}

function getVisibleCount(width: number) {
  if (width >= 1024) return 4;
  if (width >= 640) return 2;
  return 1;
}

export default function ReviewsSlider({ reviews }: Props) {
  const [index, setIndex] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [cardWidth, setCardWidth] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const update = () => {
      const el = viewportRef.current;
      if (!el) return;
      const count = getVisibleCount(window.innerWidth);
      setVisibleCount(count);
      setCardWidth((el.clientWidth - GAP_PX * (count - 1)) / count);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (reviews.length <= visibleCount) return;

    const id = setInterval(() => setSliding(true), INTERVAL_MS);
    return () => clearInterval(id);
  }, [reviews.length, visibleCount]);

  const handleTransitionEnd = useCallback(() => {
    if (!sliding) return;
    setIndex((prev) => (prev + 1) % reviews.length);
    setSliding(false);
  }, [sliding, reviews.length]);

  const cards = Array.from({ length: visibleCount + 1 }, (_, i) =>
    reviews[(index + i) % reviews.length]
  );

  const slidePx = cardWidth > 0 ? cardWidth + GAP_PX : 0;

  return (
    <section className="border-b border-border bg-background px-4 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Referanslar
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Müşteri Yorumları
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {reviews.length.toLocaleString("tr-TR")}+ doğrulanmış yorum
          </p>
        </div>

        <div ref={viewportRef} className="mt-10 overflow-hidden">
          <div
            className={`flex gap-5 ${sliding ? "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" : ""}`}
            style={{
              transform: sliding ? `translateX(-${slidePx}px)` : "translateX(0)",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {cards.map((review, i) => (
              <div
                key={`${review.id}-${index}-${i}`}
                className="shrink-0"
                style={{ width: cardWidth > 0 ? cardWidth : `${100 / visibleCount}%` }}
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
