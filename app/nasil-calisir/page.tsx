import Link from "next/link";
import { ArrowRight, CircleCheckBig, ClipboardList, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const steps = [
  {
    step: "1",
    title: "Hizmetini seç ve ihtiyacını anlat",
    desc: "Aradığın hizmeti bul, birkaç basit soruyu yanıtla ve konumunu belirt. Ev temizliği mi, nakliyat mı, tadilat mı — neye ihtiyacın varsa seç.",
    Icon: Search,
  },
  {
    step: "2",
    title: "Ustalardan teklif al",
    desc: "Bölgenizdeki doğrulanmış ustalar talebinizi görür ve size özel fiyat teklifleri gönderir. Teklifleri karşılaştır, puanları ve yorumları incele.",
    Icon: ClipboardList,
  },
  {
    step: "3",
    title: "En uygun ustayı seç",
    desc: "Beğendiğin ustayı seç, iletişime geç ve işini güvenle tamamla. Ödeme ve değerlendirme sistemiyle her adımda güvendesin.",
    Icon: CircleCheckBig,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-full bg-card">
      <Header />

      <div className="border-b border-border bg-secondary px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Nasıl Çalışır?</h1>
          <p className="mt-4 text-base text-white/70">
            Çokusta ile ihtiyacınız olan hizmete 3 adımda ulaşın.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="space-y-12">
          {steps.map(({ step, title, desc, Icon }) => (
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

        <div className="mt-16 text-center">
          <Link
            href="/hizmetler"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3.5 text-base font-semibold text-white hover:bg-primary-dark"
          >
            Hizmetlere Göz At
            <ArrowRight size={20} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
