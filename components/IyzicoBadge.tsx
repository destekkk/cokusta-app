type Props = {
  variant?: "light" | "dark";
  className?: string;
};

/** iyzico marka rengi — "iyzico" kelimesi her zaman mavi kalır */
const IYZICO_BLUE = "#1E64FF";

export default function IyzicoBadge({ variant = "dark", className = "" }: Props) {
  const secondary = variant === "dark" ? "#E5E7EB" : "#374151";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 132 24"
      role="img"
      aria-label="iyzico ile Öde"
      className={["h-5 w-auto", className].filter(Boolean).join(" ")}
    >
      <text
        x="0"
        y="18"
        fill={IYZICO_BLUE}
        fontFamily="Inter, Arial, Helvetica, sans-serif"
        fontSize="16"
        fontWeight="700"
      >
        iyzico
      </text>
      <text
        x="62"
        y="18"
        fill={secondary}
        fontFamily="Inter, Arial, Helvetica, sans-serif"
        fontSize="12"
        fontWeight="600"
      >
        ile Öde
      </text>
    </svg>
  );
}
