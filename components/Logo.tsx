import Link from "next/link";

type Props = {
  variant?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
  href?: string;
};

export default function Logo({
  variant = "light",
  size = "md",
  className = "",
  href = "/",
}: Props) {
  const isDark = variant === "dark";
  const textSize = size === "sm" ? "text-sm" : "text-base sm:text-lg";
  const padX = size === "sm" ? "px-2.5" : "px-3 sm:px-3.5";
  const padY = size === "sm" ? "py-1.5" : "py-2 sm:py-2.5";

  return (
    <Link
      href={href}
      className={[
        "inline-flex shrink-0 overflow-hidden rounded-lg font-bold leading-none tracking-wide shadow-sm transition-opacity hover:opacity-95",
        textSize,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Çokusta ana sayfa"
    >
      <span
        className={[
          padX,
          padY,
          isDark ? "bg-secondary-light text-white" : "bg-secondary text-white",
        ].join(" ")}
      >
        çok
      </span>
      <span
        className={[
          padX,
          padY,
          isDark ? "bg-primary text-white" : "bg-primary text-white",
        ].join(" ")}
      >
        usta
      </span>
    </Link>
  );
}
