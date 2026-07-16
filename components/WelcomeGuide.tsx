"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cokusta_hosgeldin_v1";

type Role = "musteri" | "usta" | null;

const musterAdimlari = [
  {
    n: "1",
    title: "Ne iş lazım?",
    text: "Boyacı mı, temizlik mi, taşıma mı? Aradığınız işi yazın veya seçin.",
  },
  {
    n: "2",
    title: "Ücretsiz ilan verin",
    text: "Adınızı, telefonunuzu ve işi anlatın. Para ödemeniz gerekmez.",
  },
  {
    n: "3",
    title: "Ustalar teklif yazar",
    text: "Ustalar size fiyat yazar. Beğendiğinizi seçersiniz. İstemediğinizi geçersiniz.",
  },
  {
    n: "4",
    title: "İş biter",
    text: "Anlaştığınız usta işi yapar. İsterseniz ödemeyi siteden güvenle yapabilirsiniz.",
  },
];

const ustaAdimlari = [
  {
    n: "1",
    title: "Üye olun",
    text: "Usta olarak kaydolun. Onaylanınca işleri görmeye başlarsınız.",
  },
  {
    n: "2",
    title: "Açık işlere bakın",
    text: "Müşterilerin yazdığı işler listede durur. Size uygun olanı seçin.",
  },
  {
    n: "3",
    title: "Teklif yazın",
    text: "Fiyatınızı yazın. Müşteri beğenirse sizi seçer. Telefonla konuşursunuz.",
  },
  {
    n: "4",
    title: "İşi yapıp kazanın",
    text: "İşi bitirin. Kazancınızı panelden takip edin.",
  },
];

export default function WelcomeGuide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(null);

  const hideOnPanel =
    pathname.startsWith("/sltn") ||
    pathname.startsWith("/usta-panel") ||
    pathname.startsWith("/musteri-panel") ||
    pathname.startsWith("/admin");

  useEffect(() => {
    if (hideOnPanel) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, [hideOnPanel]);

  const close = (remember = true) => {
    setOpen(false);
    setRole(null);
    if (remember) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  };

  if (hideOnPanel || !open) return null;

  const steps = role === "usta" ? ustaAdimlari : role === "musteri" ? musterAdimlari : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hosgeldin-baslik"
      onClick={(e) => {
        if (e.target === e.currentTarget) close(true);
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border bg-secondary px-5 py-5 text-white sm:px-6">
          <p className="text-sm font-medium text-white/80">Hoş geldiniz</p>
          <h2 id="hosgeldin-baslik" className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
            çok<span className="text-primary">usta</span> nedir?
          </h2>
          <p className="mt-2 text-base leading-relaxed text-white/90">
            Bu site, iş yaptırmak isteyenlerle usta buluşturur. Telefon rehberi gibi düşünün —
            ama iş için.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {!role ? (
            <>
              <p className="text-lg font-semibold text-foreground">Siz hangisisiniz?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Birini seçin. Size göre, basitçe anlatacağız.
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => setRole("musteri")}
                  className="rounded-xl border-2 border-border bg-background px-4 py-4 text-left transition hover:border-primary hover:bg-primary-light"
                >
                  <span className="block text-lg font-bold text-foreground">
                    İş yaptırmak istiyorum
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Ev / ofis işi var. Usta arıyorum.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("usta")}
                  className="rounded-xl border-2 border-border bg-background px-4 py-4 text-left transition hover:border-primary hover:bg-primary-light"
                >
                  <span className="block text-lg font-bold text-foreground">Ben ustayım</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    İş almak ve müşteri bulmak istiyorum.
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setRole(null)}
                className="mb-3 text-sm font-medium text-primary hover:underline"
              >
                ← Geri
              </button>

              <p className="text-lg font-semibold text-foreground">
                {role === "musteri" ? "İş yaptırmak çok kolay" : "Usta olarak böyle çalışırsınız"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Aşağıdaki adımları sırayla okuyun. Hepsi bu kadar.
              </p>

              <ol className="mt-4 space-y-3">
                {steps!.map((step) => (
                  <li
                    key={step.n}
                    className="flex gap-3 rounded-xl border border-border bg-background px-3 py-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">
                      {step.n}
                    </span>
                    <div>
                      <p className="text-base font-bold text-foreground">{step.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {role === "musteri" ? (
                  <>
                    <Link
                      href="/hizmetler"
                      onClick={() => close(true)}
                      className="rounded-xl bg-primary px-4 py-3.5 text-center text-base font-bold text-white hover:bg-primary-dark"
                    >
                      İş ilanı ver
                    </Link>
                    <Link
                      href="/musteri/giris"
                      onClick={() => close(true)}
                      className="rounded-xl border border-border bg-background px-4 py-3.5 text-center text-base font-semibold text-foreground hover:bg-muted"
                    >
                      Müşteri girişi
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/usta-ol"
                      onClick={() => close(true)}
                      className="rounded-xl bg-primary px-4 py-3.5 text-center text-base font-bold text-white hover:bg-primary-dark"
                    >
                      Usta ol
                    </Link>
                    <Link
                      href="/usta/giris"
                      onClick={() => close(true)}
                      className="rounded-xl border border-border bg-background px-4 py-3.5 text-center text-base font-semibold text-foreground hover:bg-muted"
                    >
                      Usta girişi
                    </Link>
                  </>
                )}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => close(true)}
            className="mt-4 w-full py-2.5 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Anladım, kapat
          </button>
        </div>
      </div>
    </div>
  );
}
