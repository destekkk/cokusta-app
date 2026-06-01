"use client";

import { useEffect, useState } from "react";
import LocationPicker from "@/components/LocationPicker";

type Props = {
  onUpdated?: (city: string, district: string) => void;
};

export default function CustomerProfileLocationCard({ onUpdated }: Props) {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/musteri/profil");
      if (res.status === 401) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
      setCity(data.profile?.city ?? "");
      setDistrict(data.profile?.district ?? "");
      onUpdated?.(data.profile?.city ?? "", data.profile?.district ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!city) {
      setError("İl seçin.");
      return;
    }
    setSaving(true);
    setError("");
    setSaved("");
    try {
      const res = await fetch("/api/musteri/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, district }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi");
      setCity(data.profile?.city ?? city);
      setDistrict(data.profile?.district ?? district);
      setEditing(false);
      setSaved("Varsayılan adres kaydedildi. Yeni taleplerde otomatik doldurulur.");
      onUpdated?.(data.profile?.city ?? city, data.profile?.district ?? district);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Varsayılan adresim</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Yeni talep oluştururken otomatik doldurulur. Her talep için ayrı konum da seçebilirsiniz.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted/50"
          >
            Adresi değiştir
          </button>
        )}
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      {saved && <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800">{saved}</p>}

      {editing ? (
        <div className="mt-4 space-y-3">
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
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Kaydet
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setError("");
                load();
              }}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold"
            >
              Vazgeç
            </button>
          </div>
        </div>
      ) : city ? (
        <p className="mt-3 text-sm text-foreground">
          {city}
          {district ? `, ${district}` : ""}
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Henüz kayıtlı adres yok.</p>
      )}
    </div>
  );
}
