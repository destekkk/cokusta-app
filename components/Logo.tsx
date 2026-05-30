import Link from "next/link";

type Props = {
  variant?: "light" | "dark";
  size?: "sm" | "md";
};

export default function Logo({ variant = "light", size = "md" }: Props) {
  const isDark = variant === "dark";
  const textSize = size === "sm" ? "text-lg" : "text-xl";

  return (
    <Link
      href="/"
      className={`${textSize} font-semibold tracking-wide ${isDark ? "text-white" : "text-secondary"}`}
    >
      çok<span className="text-primary">usta</span>
    </Link>
  );
}
