import Link from "next/link";

type Props = {
  variant?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
  href?: string;
};

const MAGENTA = "#C2185B";

export default function Logo({
  variant = "light",
  size = "md",
  className = "",
  href = "/",
}: Props) {
  const textSize = size === "sm" ? "text-lg" : "text-xl sm:text-2xl";
  const green = variant === "dark" ? "#3DBC6E" : "#1B6B3A";

  return (
    <Link
      href={href}
      aria-label="Çokusta ana sayfa"
      className={[
        "inline-flex shrink-0 items-baseline font-bold leading-none tracking-tight transition-opacity hover:opacity-90",
        textSize,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      <span style={{ color: MAGENTA }}>Çok</span>
      <span style={{ color: green }}>usta</span>
    </Link>
  );
}
