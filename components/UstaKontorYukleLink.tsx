import Link from "next/link";

type Props = {
  href?: string;
  className?: string;
  label?: string;
};

export default function UstaKontorYukleLink({
  href = "/usta/kontor",
  className = "",
  label = "Kontör Yükle",
}: Props) {
  return (
    <Link
      href={href}
      className={`kontor-yukle-blink inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-center text-base font-bold tracking-tight text-white shadow-lg transition-colors hover:bg-primary-dark sm:px-8 sm:py-4 sm:text-lg ${className}`.trim()}
    >
      {label}
    </Link>
  );
}
