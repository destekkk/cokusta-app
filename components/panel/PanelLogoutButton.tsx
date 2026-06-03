"use client";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  /** light: site üst menüsü (Header), dark: panel şeridi */
  variant?: "light" | "dark";
};

export default function PanelLogoutButton({
  onClick,
  disabled,
  label = "Çıkış",
  loadingLabel = "Çıkış…",
  variant = "dark",
}: Props) {
  const className =
    variant === "light"
      ? "shrink-0 rounded-md border border-red-300 bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 sm:px-3 sm:py-2 sm:text-sm"
      : "shrink-0 rounded-lg border border-red-400/60 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-60";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {disabled ? loadingLabel : label}
    </button>
  );
}
