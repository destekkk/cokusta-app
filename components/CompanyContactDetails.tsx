import { companyInfo } from "@/lib/data/company";

type Props = {
  variant?: "page" | "footer";
  showFounder?: boolean;
  showFormLink?: boolean;
  className?: string;
};

export default function CompanyContactDetails({
  variant = "page",
  showFounder = true,
  showFormLink = false,
  className = "",
}: Props) {
  const isFooter = variant === "footer";
  const labelClass = isFooter ? "text-white/70" : "text-foreground";
  const textClass = isFooter ? "text-white/55" : "text-muted-foreground";
  const linkClass = isFooter ? "hover:text-white" : "text-primary hover:underline";

  const items = [
    { label: "Unvan", value: companyInfo.legalName },
    ...(showFounder ? [{ label: "Kurucu", value: companyInfo.founder }] : []),
    { label: "Adres", value: companyInfo.address },
    {
      label: "E-posta",
      value: companyInfo.email,
      href: `mailto:${companyInfo.email}`,
    },
    {
      label: "Telefon",
      value: companyInfo.phone,
      href: `tel:${companyInfo.phone.replace(/\s/g, "")}`,
    },
    {
      label: "Vergi Dairesi / No",
      value: `${companyInfo.taxOffice} — ${companyInfo.taxNo}`,
    },
  ];

  return (
    <div className={className}>
      <ul
        className={`space-y-1.5 ${isFooter ? "text-xs leading-relaxed" : "space-y-2 text-sm"}`}
      >
        {items.map(({ label, value, href }) => (
          <li key={label} className={textClass}>
            <span className={labelClass}>{label}:</span>{" "}
            {href ? (
              <a href={href} className={linkClass}>
                {value}
              </a>
            ) : (
              value
            )}
          </li>
        ))}
      </ul>
      {showFormLink && (
        <p className={`${isFooter ? "mt-3" : "pt-2"}`}>
          <a href="/iletisim" className={`text-sm font-medium ${linkClass}`}>
            İletişim formu →
          </a>
        </p>
      )}
    </div>
  );
}
