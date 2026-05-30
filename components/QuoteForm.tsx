"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Service, ServiceQuestion } from "@/lib/types";
import { cities, getDistricts } from "@/lib/data/cities";
import { getJobDescriptionExample } from "@/lib/data/job-description-examples";

type Props = {
  service: Service;
  defaultCity?: string;
  defaultUrgent?: boolean;
};

export default function QuoteForm({ service, defaultCity = "", defaultUrgent = false }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [city, setCity] = useState(defaultCity);
  const [district, setDistrict] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [urgent, setUrgent] = useState(defaultUrgent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 3;
  const districts = city ? getDistricts(city) : [];
  const jobDescriptionExample = getJobDescriptionExample(service.slug, service.categorySlug);

  const updateAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const validateStep1 = () => {
    for (const q of service.questions) {
      if (q.required && !answers[q.id]) return false;
    }
    return notes.trim().length >= 15;
  };

  const validateStep2 = () => city.length > 0 && district.length > 0;

  const validateStep3 = () => name.trim().length >= 2 && phone.trim().length >= 10;

  const handleNext = () => {
    setError("");
    if (step === 1 && !validateStep1()) {
      setError("Lütfen zorunlu soruları yanıtlayın ve en az 15 karakterlik bir iş açıklaması yazın.");
      return;
    }
    if (step === 2 && !validateStep2()) {
      setError("Lütfen şehir ve ilçe seçin.");
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateStep3()) {
      setError("Ad soyad ve geçerli bir telefon numarası girin.");
      return;
    }
    if (notes.trim().length < 15) {
      setError("İş açıklaması en az 15 karakter olmalı.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teklif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: service.slug,
          answers,
          city,
          district,
          name,
          phone,
          email,
          notes,
          urgent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu");

      router.push(`/teklif-al/onay?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Teklif gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                s <= step
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`h-1 flex-1 rounded ${
                  s < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mb-2 text-sm font-medium text-primary">
        Adım {step}/{totalSteps}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-foreground">İhtiyacını anlatalım</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {service.name} için birkaç soru yanıtlayın.
          </p>
          <div className="mt-6 space-y-5">
            {service.questions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={answers[q.id] ?? ""}
                onChange={(v) => updateAnswer(q.id, v)}
              />
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              İş açıklaması *
            </label>
            <p className="mb-2 text-xs text-muted-foreground">
              Ustalara işin detaylarını anlatın: ne yapılacak, ne zaman, özel istekleriniz...
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={jobDescriptionExample}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              En az 15 karakter ({notes.trim().length}/15)
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-foreground">Konum bilgisi</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hizmetin nerede yapılacağını belirtin.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Şehir *
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setDistrict("");
                }}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Şehir seçin</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                İlçe *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!city}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-background"
              >
                <option value="">İlçe seçin</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                urgent
                  ? "border-red-300 bg-red-50"
                  : "border-border hover:border-red-200 hover:bg-red-50/40"
              }`}
            >
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-red-600 focus:ring-red-500"
              />
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span aria-hidden>🚨</span>
                  Çok acil — 3 gün içinde yapılmalı
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  İlanınız Çok Acil bölümünde öne çıkar ve bölgenizdeki ustalara anında
                  bildirilir. Acil işler öncelikli eşleştirilir.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold text-foreground">İletişim bilgileri</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ustalar tekliflerini bu bilgilerle size ulaşsın.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Ad Soyad *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız Soyadınız"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Telefon *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                E-posta (opsiyonel)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-accent"
          >
            Geri
          </button>
        )}
        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Devam Et
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "Gönderiliyor..." : "Ücretsiz Teklif Al"}
          </button>
        )}
      </div>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: ServiceQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {question.label} {question.required && "*"}
      </label>
      {question.type === "select" && question.options ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                value === opt.value
                  ? "border-primary bg-primary-light font-medium text-primary"
                  : "border-border text-foreground hover:border-primary/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : question.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={3}
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      )}
    </div>
  );
}
