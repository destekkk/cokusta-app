import Link from "next/link";

type Props = {
  variant?: "light" | "dark";
  size?: "sm" | "md";
};

export default function Logo({ variant = "light", size = "md" }: Props) {
  const isDark = variant === "dark";
  const textSize = size === "sm" ? "text-base" : "text-lg";
  const boxPadding = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";

  return (
    <Link
      href="/"
      className={[
        "inline-flex items-center justify-center rounded-none border-2 font-semibold leading-none tracking-wide transition-colors",
        boxPadding,
        textSize,
        isDark
          ? "border-white/55 text-white hover:border-white/80"
          : "border-primary text-secondary hover:border-primary-dark",
      ].join(" ")}
    >
      çok<span className={isDark ? "text-primary-light" : "text-primary"}>usta</span>
    </Link>
  );
}
