import Link from "next/link";
import {
  ArrowRight,
  CircleCheckBig,
  ClipboardList,
  Handshake,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ParamGuvendePitch from "@/components/ParamGuvendePitch";
import {
  PARAM_GUVENDE_FEE_RATE_ABOVE_THRESHOLD,
  PARAM_GUVENDE_FEE_RATE_STANDARD,
  PARAM_GUVENDE_FEE_THRESHOLD,
} from "@/lib/param-guvende";

const customerSteps = [
  {
    step: "1",
    title: "Hizmetini seç, ihtiyacını anlat",
    desc: "Kategoriden hizmeti seç, birkaç soruyu yanıtla ve il/ilçe belirle. İstersen talep oluşturduktan sonra konumu müşteri panelinden güncelleyebilirsin.",
    Icon: Search,
  },
  {
    step: "2",
    title: "Ustalardan teklif al, pazarlık yap",
    desc: "Onaylı ve doğrulanmış ustalar talebinizi görür, size özel fiyat teklifleri gönderir. Teklifleri karşılaştırır, karşı teklif verebilir veya doğrudan Anlaştık diyebilirsiniz.",
    Icon: ClipboardList,
  },
  {
    step: "3",
    title: "Anlaşın, Param Güvende ile ödeyin",
    desc: "Beğendiğiniz ustaya Anlaştık dedikten sonra Param Güvende ile güvenli ödeme yapın. Tutar iş bitene kadar havuzda tutulur; usta onayladıktan sonra iletişim bilgileri açılır. Usta onaylamadan anlaşmaktan vazgeçebilirsiniz.",
    Icon: ShieldCheck,
  },
  {
    step: "4",
    title: "İş bitince ödemeyi onaylayın",
    desc: "Usta işi tamamladığında siz kontrol edersiniz. Her şey yolundaysa İş bitti — ödemeyi yolla butonuyla iş bedelini ustaya aktarırsınız. Memnun kalmazsanız ödeme havuzda kalır.",
    Icon: CircleCheckBig,
  },
];

const providerSteps = [
  {
    title: "Talepleri gör, teklif ver",
    desc: "Kendi ilinizde veya farklı illerde açık taleplere teklif verin. Verdiğim Teklifler sekmesinden tüm tekliflerinizi takip edin.",
  },
  {
    title: "Pazarlık ve anlaşma",
    desc: "Müşteri Anlaştık dedikten sonra siz de onaylayın. Müşteri onayı olmadan karşı teklif verilemez; bekleyen anlaşma varken yeni teklif verilmez.",
  },
  {
    title: "Param Güvende bildirimi",
    desc: "Müşteri Param Güvende ile ödediğinde para havuzda bekler — size bildirim gider. İş bitip müşteri onayladığında tutar hesabınıza yüklenir.",
  },
];

export default function HowItWorksPage() {
  const feeStandardPct = PARAM_GUVENDE_FEE_RATE_STANDARD * 100;
  const feeAbovePct = PARAM_GUVENDE_FEE_RATE_ABOVE_THRESHOLD * 100;
  const feeThreshold = PARAM_GUVENDE_FEE_THRESHOLD.toLocaleString("tr-TR");

  return (
    <div className="min-h-full bg-card">
      <Header />

      <div className="border-b border-border bg-secondary px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Nasıl Çalışır?</h1>
          <p className="mt-4 text-base text-white/70">
            Teklif alın, pazarlık yapın, Param Güvende ile güvenle ödeyin — 4 adımda.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Müşteriler için</p>

        <div className="mt-8 space-y-12">
          {customerSteps.map(({ step, title, desc, Icon }) => (
            <div key={step} className="flex gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon size={26} strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Adım {step}
                </div>
                <h2 className="mt-1 text-xl font-semibold text-foreground">{title}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-border bg-muted/30 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={22} />
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Param Güvende nedir?</h2>
              <ParamGuvendePitch />
              <p className="text-sm text-muted-foreground">
                Hizmet bedeli: {feeThreshold} ₺&apos;ye kadar %{feeStandardPct}, üzeri kısım için
                %{feeAbovePct}. Kart ile online ödeme geçici olarak kapalıdır; detay için iletişime geçin.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-14">
          <div className="flex items-center gap-2">
            <Wrench className="text-primary" size={22} />
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Ustalar için
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {providerSteps.map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <Handshake className="mb-3 text-primary" size={22} strokeWidth={2} />
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Profil adresinizi güncelleyebilir, farklı illerdeki taleplere teklif verebilirsiniz.{" "}
            <Link href="/usta/uygulama" className="font-medium text-primary hover:underline">
              Mobil usta uygulaması
            </Link>{" "}
            ile yeni taleplerden anında haberdar olun.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <Link
            href="/hizmetler"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3.5 text-base font-semibold text-white hover:bg-primary-dark"
          >
            Hizmetlere Göz At
            <ArrowRight size={20} strokeWidth={2} />
          </Link>
          <Link
            href="/usta/giris"
            className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-3.5 text-base font-semibold hover:border-primary/40"
          >
            Usta Girişi
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
