import AdminOfferReviewsPanel from "@/components/admin/AdminOfferReviewsPanel";
import { listAdminOfferReviews } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Müşteri Değerlendirmeleri | Yönetim",
};

export default async function AdminOfferReviewsPage() {
  const reviews = await listAdminOfferReviews({ status: "pending", limit: 150 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Müşteri değerlendirmeleri</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bitmiş işler için müşterilerin gönderdiği puan ve yorumlar. Onayladıktan sonra usta
        profilinde görünür. Usta bilgileri yanında listelenir; gerekirse doğrudan arayabilirsiniz.
      </p>
      <div className="mt-8">
        <AdminOfferReviewsPanel initialReviews={reviews} initialFilter="pending" />
      </div>
    </div>
  );
}
