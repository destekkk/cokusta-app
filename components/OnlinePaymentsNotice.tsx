import Link from "next/link";
import { companyInfo } from "@/lib/data/company";

type Props = {
  className?: string;
  /** Usta kontör / platform hizmeti için ek bilgi */
  variant?: "default" | "usta-kontor" | "param-guvende";
};

const variantCopy: Record<NonNullable<Props["variant"]>, string> = {
  default:
    "Kart ile online ödeme geçici olarak kapalıdır. Kontör, paket veya güvenli ödeme için bizimle iletişime geçin.",
  "usta-kontor":
    "Kontör ve platform hizmeti satın alımı şu an online yapılamıyor. Fiyat listesini inceleyip havale/EFT veya kurumsal süreç için destek ekibimize yazın.",
  "param-guvende":
    "Param Güvende ile kart ödemesi geçici olarak kapalıdır. Anlaştığınız usta ile ödeme koşullarını doğrudan görüşebilir veya destek ekibimizden bilgi alabilirsiniz.",
};

export default function OnlinePaymentsNotice({
  className = "",
  variant = "default",
}: Props) {
  const whatsappUrl = `https://wa.me/${companyInfo.whatsapp}?text=${encodeURIComponent(
    "Merhaba, Çokusta ödeme / kontör hakkında bilgi almak istiyorum."
  )}`;

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 ${className}`}
    >
      <p className="font-semibold">Online ödeme şu an kullanılamıyor</p>
      <p className="mt-2 leading-relaxed">{variantCopy[variant]}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          WhatsApp ile yazın
        </a>
        <Link
          href="/iletisim"
          className="inline-flex rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium hover:bg-amber-100/50"
        >
          İletişim sayfası
        </Link>
      </div>
      <p className="mt-3 text-xs text-amber-800/90">
        {companyInfo.email} · {companyInfo.phone}
      </p>
    </div>
  );
}
