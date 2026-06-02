"use client";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
};

/** Admin paneli ile aynı stil — koyu zemin üzerinde belirgin kırmızı çıkış */
export default function PanelLogoutButton({
  onClick,
  disabled,
  label = "Çıkış",
  loadingLabel = "Çıkış…",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 rounded-lg border border-red-400/60 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-60"
    >
      {disabled ? loadingLabel : label}
    </button>
  );
}
