"use client";

import { useEffect, useRef, useState } from "react";

type StatItem = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

type Props = {
  stats: StatItem[];
};

function useCountUp(
  target: number,
  active: boolean,
  duration = 2000,
  decimals = 0
) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return;

    let startTime: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Number((target * eased).toFixed(decimals)));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration, decimals]);

  return current;
}

function StatCounter({
  item,
  active,
}: {
  item: StatItem;
  active: boolean;
}) {
  const count = useCountUp(item.value, active, 2200, item.decimals ?? 0);

  const formatted =
    item.decimals && item.decimals > 0
      ? count.toFixed(item.decimals)
      : Math.round(count).toLocaleString("tr-TR");

  return (
    <div className="text-center">
      <div className="text-xl font-semibold tabular-nums text-secondary sm:text-2xl">
        {item.prefix}
        {formatted}
        {item.suffix}
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
        {item.label}
      </div>
    </div>
  );
}

export default function AnimatedStats({ stats }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="px-4 pt-6 pb-2 sm:px-6">
      <div
        ref={ref}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-4 border border-border bg-card px-4 py-5 sm:grid-cols-4 sm:gap-6 sm:px-6 sm:py-5"
      >
        {stats.map((item) => (
          <StatCounter key={item.label} item={item} active={active} />
        ))}
      </div>
    </section>
  );
}
