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
          ? "border-orange-400 bg-orange-500/15 text-white hover:border-orange-300 hover:bg-orange-500/25"
          : "border-orange-500 bg-orange-50 text-secondary hover:border-orange-600 hover:bg-orange-100/80",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Çokusta ana sayfa"
    >
      çok<span className={isDark ? "text-orange-300" : "text-orange-600"}>usta</span>
    </Link>
  );
}
