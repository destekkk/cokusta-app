"use client";

import { useState } from "react";
import LocationPicker from "@/components/LocationPicker";

type Props = {
  quoteId: string;
  city: string;
  district: string;
  editable: boolean;
  onUpdated: (city: string, district: string) => void;
};

export default function QuoteLocationEditor({
  quoteId,
  city: initialCity,
  district: initialDistrict,
  editable,
  onUpdated,
}: Props) {
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(initialDistrict);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!city || !district) {
      setError("İl ve ilçe seçin.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/musteri/teklif/${quoteId}/konum`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, district }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Güncellenemedi");
      setCity(data.quote?.city ?? city);
      setDistrict(data.quote?.district ?? district);
      setEditing(false);
      onUpdated(data.quote?.city ?? city, data.quote?.district ?? district);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  if (!editable) {
    return (
      <p className="text-sm text-muted-foreground">
        Konum: {initialCity}
        {initialDistrict ? `, ${initialDistrict}` : ""}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Talep konumu</p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Konumu değiştir
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {editing ? (
        <div className="mt-3 space-y-3">
          <LocationPicker
            city={city}
            district={district}
            onCityChange={setCity}
            onDistrictChange={setDistrict}
            disabled={saving}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Kaydet
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setCity(initialCity);
                setDistrict(initialDistrict);
                setError("");
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
            >
              Vazgeç
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          {city}
          {district ? `, ${district}` : ""}
        </p>
      )}
    </div>
  );
}
