import type { Category } from "../types";

export const categories: Category[] = [
  {
    slug: "tadilat",
    name: "Tadilat",
    description: "Ev ve iş yeri tadilat hizmetleri",
  },
  {
    slug: "nakliyat",
    name: "Nakliyat",
    description: "Evden eve ve ofis taşıma hizmetleri",
  },
  {
    slug: "temizlik",
    name: "Temizlik",
    description: "Ev, ofis ve detaylı temizlik hizmetleri",
  },
  {
    slug: "boya",
    name: "Boya & Badana",
    description: "İç ve dış cephe boya badana işleri",
  },
  {
    slug: "elektrik",
    name: "Elektrik",
    description: "Elektrik tesisatı ve arıza hizmetleri",
  },
  {
    slug: "tesisat",
    name: "Tesisat",
    description: "Su, doğalgaz ve kalorifer tesisatı",
  },
  {
    slug: "tamirat",
    name: "Tamirat & Servis",
    description: "Ev aleti, elektronik, oto ve tekne onarım hizmetleri",
  },
  {
    slug: "bahce",
    name: "Bahçe",
    description: "Peyzaj ve bahçe bakım hizmetleri",
  },
  {
    slug: "ozel-ders",
    name: "Özel Ders",
    description: "Birebir eğitim ve özel ders hizmetleri",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryName(slug: string): string {
  return getCategoryBySlug(slug)?.name ?? slug;
}
