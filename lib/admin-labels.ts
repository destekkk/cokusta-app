export const experienceLabels: Record<string, string> = {
  "0-1": "0-1 yıl",
  "1-3": "1-3 yıl",
  "3-5": "3-5 yıl",
  "5+": "5+ yıl",
};

export function formatExperience(value: string): string {
  if (!value) return "Belirtilmemiş";
  return experienceLabels[value] ?? value;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
