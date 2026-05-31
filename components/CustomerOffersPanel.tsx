"use client";

import { useEffect, useState } from "react";
import type { ProviderOffer } from "@/lib/types";

type Props = {
  quoteId: string;
  serviceName: string;
};

export default function CustomerOffersPanel({ quoteId, serviceName }: Props) {
  const [phone, setPhone] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState<ProviderOffer[]>([]);
  const [quoteStatus, setQuoteStatus] = useState("");
  const [contacts, setContacts] = useState<{
    customer: { name: string; phone: string; email: string };
    provider: { name: string; phone: string; email: string };
  } | null>(null);

  const loadOffers = async () => {
    const res = await fetch(`/api/musteri/teklif/${quoteId}/teklifler`);
    if (res.status === 401) {
      setVerified(false);
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
    setOffers(data.offers ?? []);
    setQuoteStatus(data.quote?.status ?? "");
    setContacts(data.contacts ?? null);
    setVerified(true);
  };

  useEffect(() => {
    fetch(`/api/musteri/teklif/${quoteId}/dogrula`)
      .then((r) => r.json())
      .then((d) => {
        if (d.verified) loadOffers().catch(() => setVerified(false));
      })
      .catch(() => {});
  }, [quoteId]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/musteri/teklif/${quoteId}/dogrula`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Doğrulama başarısız");
      await loadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Doğrulama başarısız");
    } finally {
      setLoading(false);
    }
  };

  const accept = async (offerId: string) => {
    if (!confirm("Bu ustayı seçmek istediğinize emin misiniz? Telefon numaraları karşılıklı açılacaktır.")) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/musteri/teklif/${quoteId}/kabul`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kabul edilemedi");
      await loadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kabul edilemedi");
    } finally {
      setLoading(false);
    }
  };

  if (!verified) {
    return (
      <form onSubmit={verify} className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          <strong>{serviceName}</strong> talebinize gelen teklifleri görmek için talep sırasında
          verdiğiniz telefon numarasını girin.
        </p>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="05XX XXX XX XX"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Doğrulanıyor…" : "Devam Et"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {quoteStatus === "accepted" && contacts && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 space-y-3">
          <p className="font-semibold text-green-900">Usta seçildi — iletişim bilgileri açıldı</p>
          <p className="text-sm text-green-800">
            <strong>Usta:</strong> {contacts.provider.name} ·{" "}
            <a href={`tel:${contacts.provider.phone}`} className="underline">
              {contacts.provider.phone}
            </a>
          </p>
          <p className="text-sm text-green-800">
            Sizin numaranız ustaya iletildi: {contacts.customer.phone}
          </p>
        </div>
      )}

      {quoteStatus === "open" && offers.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          Henüz usta teklifi gelmedi. Ustalar teklif verdikçe burada görünecek.
        </p>
      )}

      {quoteStatus === "open" && offers.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {offers.length} teklif alındı. Usta telefonları kabul edene kadar gizlidir.
          </p>
          {offers.map((offer) => (
            <article key={offer.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{offer.providerName ?? "Usta"}</h3>
                  <p className="text-sm text-muted-foreground">{offer.providerCity}</p>
                </div>
                <p className="text-lg font-bold text-primary">
                  {offer.price.toLocaleString("tr-TR")} ₺
                </p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{offer.message}</p>
              <button
                type="button"
                disabled={loading}
                onClick={() => accept(offer.id)}
                className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Bu Ustayı Kabul Et
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
