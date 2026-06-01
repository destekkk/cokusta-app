import { companyInfo } from "@/lib/data/company";

/** Fatura / admin — env varsa override, yoksa companyInfo */
export function getCompanyInfo() {
  return {
    name: process.env.COMPANY_NAME ?? companyInfo.legalName,
    taxNumber: process.env.COMPANY_TAX_NUMBER ?? companyInfo.taxNo,
    taxOffice: process.env.COMPANY_TAX_OFFICE ?? companyInfo.taxOffice,
    address: process.env.COMPANY_ADDRESS ?? companyInfo.address,
    email: process.env.COMPANY_EMAIL ?? companyInfo.email,
    phone: process.env.COMPANY_PHONE ?? companyInfo.phone,
  };
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: companyInfo.legalName,
    url: companyInfo.website,
    email: companyInfo.email,
    telephone: companyInfo.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hanlı Merkez Mah. Anıl Sok. No:7",
      addressLocality: "Arifiye",
      addressRegion: "Sakarya",
      addressCountry: "TR",
    },
  };
}
