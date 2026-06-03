"use client";

import { formatTlDigits, digitsFromTlInput, TL_AMOUNT_MAX_DIGITS } from "@/lib/currency-input";

type Props = {
  digits: string;
  onDigitsChange: (digits: string) => void;
  maxDigits?: number;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "aria-label"?: string;
};

export default function CurrencyInput({
  digits,
  onDigitsChange,
  maxDigits = TL_AMOUNT_MAX_DIGITS,
  className = "",
  inputClassName = "",
  disabled,
  placeholder = "0",
  id,
  "aria-label": ariaLabel = "Tutar",
}: Props) {
  return (
    <div
      className={[
        "flex min-w-[8.5rem] max-w-full overflow-hidden rounded-lg border border-border bg-background",
        disabled ? "opacity-60" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={formatTlDigits(digits, maxDigits)}
        onChange={(e) => onDigitsChange(digitsFromTlInput(e.target.value, maxDigits))}
        className={[
          "min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
          inputClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <span
        className="flex shrink-0 items-center border-l border-border bg-muted/50 px-3 text-sm font-semibold text-muted-foreground"
        aria-hidden
      >
        TL
      </span>
    </div>
  );
}
