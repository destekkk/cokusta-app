import Link from "next/link";
import { notFound } from "next/navigation";
import ProviderPortfolioAdmin from "@/components/admin/ProviderPortfolioAdmin";
import { getCategoryName } from "@/lib/data/categories";
import { formatDateTime, formatExperience } from "@/lib/admin-labels";
import ProviderActions from "@/components/admin/ProviderActions";
import { getProviderById } from "@/lib/db";
import type { ProviderRegistration } from "@/lib/types";

const statusLabels: Record<ProviderRegistration["status"], string> = {
  pending: "Onay Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

const statusColors: Record<ProviderRegistration["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

type Props = { params: Promise<{ id: string }> };

export default async function ProviderApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const provider = await getProviderById(id);
  if (!provider) notFound();

  const categories = provider.categorySlugs.map(getCategoryName).join(", ");
  const phoneValid = provider.phone.replace(/\D/g, "").length >= 10;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/ustalar"
        className="text-sm font-medium text-primary hover:underline"
      >
        ← Başvuru listesine dön
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Başvuru tarihi: {formatDateTime(provider.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[provider.status]}`}
        >
          {statusLabels[provider.status]}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Telefon", provider.phone],
          ["E-posta", provider.email || "Belirtilmemiş"],
          ["Şehir", provider.city],
          ...(provider.companyName ? [["Firma", provider.companyName] as const] : []),
          ["Deneyim", formatExperience(provider.experience)],
          ["Kategoriler", categories],
          ["Başvuru No", provider.id],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <div className="text-xs uppercase text-muted-foreground">{label}</div>
            <div className={`mt-1 text-sm ${label === "Başvuru No" ? "font-mono" : ""}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-5">
        <div className="text-xs uppercase text-muted-foreground">Kendini Tanıtma</div>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {provider.bio?.trim() || "Aday kendini tanıtan bir metin yazmamış."}
        </p>
      </div>

      {provider.status === "rejected" && provider.rejectionReason && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>Red nedeni:</strong> {provider.rejectionReason}
        </div>
      )}

      {provider.status === "pending" && (
        <div className="mt-6 space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div>
            <p className="text-sm font-semibold text-amber-900">Onay kontrol listesi</p>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              <li>{phoneValid ? "✓" : "✗"} Telefon numarası geçerli görünüyor mu?</li>
              <li>{provider.email ? "✓" : "○"} E-posta adresi var mı?</li>
              <li>{provider.experience ? "✓" : "○"} Deneyim bilgisi girilmiş mi?</li>
              <li>{provider.bio?.trim() ? "✓" : "○"} Kendini tanıtma metni yazılmış mı?</li>
              <li>{provider.categorySlugs.length > 0 ? "✓" : "✗"} En az bir kategori seçilmiş mi?</li>
            </ul>
          </div>
          <ProviderActions
            providerId={provider.id}
            status={provider.status}
            redirectTo="/admin/ustalar"
          />
        </div>
      )}

      <ProviderPortfolioAdmin
        providerId={provider.id}
        providerName={provider.name}
        items={provider.portfolio ?? []}
      />
    </div>
  );
}
