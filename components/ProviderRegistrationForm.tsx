"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NEW_PIN_LENGTH, sanitizePinDigits, validateNewPin } from "@/lib/provider-pin";
import { categories } from "@/lib/data/categories";
import { cities } from "@/lib/data/cities";
import { CategoryIconBadge } from "@/components/icons/CategoryIcon";

export default function ProviderRegistrationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginHint, setLoginHint] = useState(false);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginHint(false);

    if (!name || !phone || !city || selectedCategories.length === 0) {
      setError("Lütfen zorunlu alanları doldurun ve en az bir kategori seçin.");
      return;
    }

    const pinCheck = validateNewPin(pin);
    if (!pinCheck.ok) {
      setError(pinCheck.error);
      return;
    }

    if (pin !== pinConfirm) {
      setError("Giriş şifreleri eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/usta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          companyName: companyName.trim() || undefined,
          phone,
          email,
          city,
          categorySlugs: selectedCategories,
          experience,
          bio,
          pin,
          pinConfirm,
        }),
      });

      const data = await res.json();
      if (data.code === "PHONE_ALREADY_REGISTERED") {
        setLoginHint(true);
        throw new Error(data.error ?? "Bu telefon numarasıyla zaten usta kaydı var.");
      }
      if (!res.ok) throw new Error(data.error ?? "Kayıt başarısız");

      router.push(`/usta-ol/onay?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <p className="rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        Teklif alırken kullandığınız telefon numarasıyla usta başvurusu yapabilirsiniz. Aynı numarayla
        tekrar usta kaydı oluşturulamaz; müşteri olarak teklif almaya devam edebilirsiniz.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Ad Soyad *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Ahmet Yılmaz"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Firma İsmi
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Örn. Yılmaz Tesisat"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Telefon *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="5XX XXX XX XX"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">Başına 0 yazmadan da girebilirsiniz.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Giriş şifresi ({NEW_PIN_LENGTH} hane) *
          </label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={NEW_PIN_LENGTH}
            value={pin}
            onChange={(e) => setPin(sanitizePinDigits(e.target.value))}
            placeholder="••••••"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm tracking-widest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Şifre tekrar *</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={NEW_PIN_LENGTH}
            value={pinConfirm}
            onChange={(e) => setPinConfirm(sanitizePinDigits(e.target.value))}
            placeholder="••••••"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm tracking-widest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        {NEW_PIN_LENGTH} haneli şifre. 111111, 123456, 000000 gibi kolay şifreler kullanılamaz.
      </p>

      <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Şehir *</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Şehir seçin</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Hizmet Kategorileri *
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => toggleCategory(cat.slug)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all ${
                selectedCategories.includes(cat.slug)
                  ? "border-primary bg-primary-light font-medium text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:bg-accent"
              }`}
            >
              <CategoryIconBadge
                slug={cat.slug}
                size={14}
                variant={selectedCategories.includes(cat.slug) ? "selected" : "default"}
              />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Deneyim</label>
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Seçin</option>
          <option value="0-1">0-1 yıl</option>
          <option value="1-3">1-3 yıl</option>
          <option value="3-5">3-5 yıl</option>
          <option value="5+">5+ yıl</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Kendinizi tanıtın</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Deneyiminiz, uzmanlık alanlarınız..."
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {error && (
        <div className="space-y-2">
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          {loginHint && (
            <Link href="/usta/giris" className="text-sm font-semibold text-primary hover:underline">
              Usta girişi yap →
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? "Kaydediliyor..." : "Başvuruyu Gönder"}
      </button>
    </form>
  );
}
