import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LAUNCH_CAMPAIGN } from "@/lib/campaigns";
import { getProviderById } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ProviderConfirmationPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const provider = id ? await getProviderById(id) : undefined;
  const inLaunchCampaign = Boolean(provider?.launchMemberNumber);

  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-3xl">
            🎉
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Başvurunuz alındı!</h1>
          <p className="mt-3 text-muted-foreground">
            Ekibimiz başvurunuzu inceleyecek ve en kısa sürede sizinle iletişime geçecek.
          </p>

          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-left">
            <p className="text-sm font-bold text-primary">🎁 Hoş geldin hediyesi</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Onay sonrası hesabınıza{" "}
              <strong>{LAUNCH_CAMPAIGN.provider.freeCredits} ücretsiz teklif kontörü</strong>{" "}
              yüklenecek. Kontörler bitince paket satın alarak teklif vermeye devam edebilirsiniz
              — fiyatlarımız Armut&apos;un yarısı.
            </p>
          </div>

          {inLaunchCampaign && provider && (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-left text-sm text-muted-foreground">
              Lansman sırası: <strong>#{provider.launchMemberNumber}</strong>. ilk{" "}
              {LAUNCH_CAMPAIGN.provider.maxSlots} ustadan biri olarak kaydoldunuz.
            </div>
          )}

          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-left text-sm text-muted-foreground">
            Onay sonrası{" "}
            <Link href="/usta/portfolyo" className="font-semibold text-primary hover:underline">
              portfolyo sayfasından
            </Link>{" "}
            yaptığınız işlerin fotoğraflarını yükleyebilirsiniz.
          </div>

          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
