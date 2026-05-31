import { companyInfo } from "@/lib/data/company";

const DEFAULT_MESSAGE = "Merhaba, Çokusta hakkında bilgi almak istiyorum.";

export function getWhatsAppChatUrl(message = DEFAULT_MESSAGE): string {
  return `https://wa.me/${companyInfo.whatsapp}?text=${encodeURIComponent(message)}`;
}
