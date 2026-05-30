import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { services } from "@/lib/data/services";

export default function AllServicesPage() {
  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="border-b border-border bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-foreground">Tüm Hizmetler</h1>
          <p className="mt-2 text-muted-foreground">
            İhtiyacın olan hizmeti seç, ücretsiz teklif al.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
