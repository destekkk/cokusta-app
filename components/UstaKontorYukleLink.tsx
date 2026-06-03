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
      className={`inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark ${className}`.trim()}
    >
      {label}
    </Link>
  );
}
