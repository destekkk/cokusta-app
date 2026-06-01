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
  const boxSize = size === "sm" ? "h-9 min-w-[4.5rem] px-2" : "h-11 min-w-[5.5rem] px-2.5 sm:px-3";

  return (
    <Link
      href={href}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-none border-[3px] font-bold leading-none tracking-wide transition-colors",
        boxSize,
        textSize,
        isDark
          ? "border-primary/50 bg-primary/15 text-white hover:border-primary hover:bg-primary/25"
          : "border-primary bg-primary-light text-secondary hover:border-primary-dark hover:bg-primary/10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Çokusta ana sayfa"
    >
      çok<span className={isDark ? "text-primary-light" : "text-primary"}>usta</span>
    </Link>
  );
}
