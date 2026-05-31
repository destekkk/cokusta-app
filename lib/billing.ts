export function getVatRate(): number {
  const rate = parseFloat(process.env.PLATFORM_VAT_RATE ?? "0.20");
  return Number.isFinite(rate) ? rate : 0.20;
}

export function getCompanyInfo() {
  return {
    name: process.env.COMPANY_NAME ?? "Çokusta Teknoloji",
    taxNumber: process.env.COMPANY_TAX_NUMBER ?? "9330231496",
    taxOffice: process.env.COMPANY_TAX_OFFICE ?? "Ali Fuat Cebesoy",
    address:
      process.env.COMPANY_ADDRESS ??
      "Hanlı Merkez Mah. Anıl Sok. No:7, Arifiye / Sakarya",
    email: process.env.COMPANY_EMAIL ?? "destek@cokusta.com",
    phone: process.env.COMPANY_PHONE ?? "+90 555 526 9770",
  };
}

export function calculateVat(subtotal: number, vatRate = getVatRate()) {
  const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;
  return { subtotal, vatRate, vatAmount, total };
}

export function formatPeriod(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-");
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  return `${monthNames[Number(month) - 1]} ${year}`;
}

export function generateInvoiceNo(period: string, sequence: number): string {
  const compact = period.replace("-", "");
  return `COK-${compact}-${String(sequence).padStart(4, "0")}`;
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}
