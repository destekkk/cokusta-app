import Image from "next/image";

type Props = {
  variant?: "light" | "dark";
  className?: string;
};

/** Kart markaları (bilgilendirme; online tahsilat kapalıyken gösterilmez) */
export default function PaymentBadges({ variant = "dark", className = "" }: Props) {
  const bg =
    variant === "dark"
      ? "rounded-lg bg-white/10 px-3 py-2"
      : "rounded-lg border border-border bg-card px-3 py-2";

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-3 sm:justify-start ${className}`}
      aria-hidden
    >
      <div className={`${bg} flex h-10 items-center`}>
        <Image
          src="/images/payments/visa.svg"
          alt=""
          width={48}
          height={16}
          className="h-4 w-auto opacity-60"
        />
      </div>
      <div className={`${bg} flex h-10 items-center`}>
        <Image
          src="/images/payments/mastercard.svg"
          alt=""
          width={36}
          height={22}
          className="h-5 w-auto opacity-60"
        />
      </div>
    </div>
  );
}
