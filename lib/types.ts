export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type ServiceQuestion = {
  id: string;
  label: string;
  type: "select" | "text" | "textarea";
  options?: { value: string; label: string }[];
  required: boolean;
  placeholder?: string;
};

export type Service = {
  slug: string;
  name: string;
  categorySlug: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  providers: number;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  popular: boolean;
  questions: ServiceQuestion[];
};

export type QuoteRequest = {
  id: string;
  serviceSlug: string;
  serviceName: string;
  categoryName: string;
  answers: Record<string, string>;
  city: string;
  district: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: string;
  status: "awaiting_review" | "open" | "accepted" | "completed" | "cancelled";
  matchedProviderId?: string;
  matchedProviderName?: string;
  acceptedOfferId?: string;
  jobValue?: number;
  commissionRate?: number;
  commissionAmount?: number;
  completedAt?: string;
  invoiceId?: string;
  /** Lansman: ilk 1000 ilana öncelikli usta eşleştirmesi */
  priorityListing?: boolean;
  launchMemberNumber?: number;
  /** 3 gün içinde tamamlanması gereken çok acil iş */
  urgent?: boolean;
  urgentDeadline?: string;
};

export type ProviderOffer = {
  id: string;
  quoteRequestId: string;
  providerId: string;
  providerName?: string;
  providerCity?: string;
  price: number;
  message: string;
  estimatedDays?: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
};

export type ProviderPlatformPurchase = {
  id: string;
  serviceSlug: string;
  serviceName: string;
  amount: number;
  purchasedAt: string;
  status: "active" | "expired" | "cancelled";
  invoiceId?: string;
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  referenceType: "quote" | "platform-purchase";
  referenceId: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  description: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  period: string;
  issuedAt: string;
};

export type TaxDeclaration = {
  id: string;
  period: string;
  periodLabel: string;
  invoiceCount: number;
  taxableBase: number;
  calculatedVat: number;
  totalAmount: number;
  createdAt: string;
};

export type BillableItem = {
  key: string;
  type: "quote" | "platform-purchase";
  referenceId: string;
  providerId?: string;
  title: string;
  recipientName: string;
  amount: number;
  date: string;
  invoiceId?: string;
};

export type ProviderPortfolioItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  serviceSlug?: string;
  createdAt: string;
};

export type PortfolioWithProvider = ProviderPortfolioItem & {
  providerId: string;
  providerName: string;
  providerCity: string;
};

export type ProviderRegistration = {
  id: string;
  name: string;
  companyName?: string;
  phone: string;
  email: string;
  city: string;
  categorySlugs: string[];
  experience: string;
  bio: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  reviewedAt?: string;
  rejectionReason?: string;
  platformPurchases?: ProviderPlatformPurchase[];
  /** Kullanılabilir teklif kontörü bakiyesi */
  creditBalance?: number;
  /** Borç kredisi ile kullanılan kontör (en fazla 5) */
  creditDebt?: number;
  /** Lansman kampanyası sıra numarası (1–500) */
  launchMemberNumber?: number;
  launchBonusGranted?: boolean;
  portfolio?: ProviderPortfolioItem[];
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  notes?: string;
  createdAt: string;
};

export type CustomerSummary = {
  id?: string;
  key: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  notes?: string;
  requestCount: number;
  completedJobs: number;
  totalSpent: number;
  platformRevenue: number;
  lastRequestAt: string;
};

export type ProviderSummary = ProviderRegistration & {
  completedJobs: number;
  activeJobs: number;
  totalJobEarnings: number;
  platformSpend: number;
  certificateCount?: number;
  isMasterCraftsman?: boolean;
};

export type CertificateType = "master_craftsman" | "provider_of_month";

export type ProviderCertificate = {
  id: string;
  providerId: string;
  providerName: string;
  type: CertificateType;
  title: string;
  description: string;
  period?: string;
  issuedAt: string;
  blockIndex: number;
  blockHash: string;
  previousHash: string;
  metadata: {
    completedJobs?: number;
    totalEarnings?: number;
    city?: string;
    categories?: string[];
  };
};

export type CertificateBlock = {
  index: number;
  timestamp: string;
  certificateId: string;
  data: string;
  previousHash: string;
  hash: string;
};

export type ProviderOfTheMonth = {
  period: string;
  periodLabel: string;
  providerId: string;
  providerName: string;
  certificateId: string;
  selectedAt: string;
  reason?: string;
  status: "pending" | "published" | "removed";
  creditsAwarded: number;
  publishedAt?: string;
};

export type CreditPurchaseOrder = {
  id: string;
  providerId: string;
  packageSlug: string;
  packageName: string;
  credits: number;
  packageAmount: number;
  debtCredits: number;
  amount: number;
  conversationId: string;
  basketId: string;
  status: "pending" | "completed" | "failed";
  iyzicoToken?: string;
  iyzicoPaymentId?: string;
  purchaseId?: string;
  createdAt: string;
  completedAt?: string;
};

export type ProviderReferral = {
  id: string;
  referrerId: string;
  referredPhone: string;
  referredProviderId?: string;
  creditsAwarded: number;
  createdAt: string;
};

export type Store = {
  quoteRequests: QuoteRequest[];
  providerOffers: ProviderOffer[];
  providers: ProviderRegistration[];
  customers: Customer[];
  invoices: Invoice[];
  taxDeclarations: TaxDeclaration[];
  providerCertificates: ProviderCertificate[];
  certificateLedger: CertificateBlock[];
  providerOfTheMonthHistory: ProviderOfTheMonth[];
  creditPurchaseOrders: CreditPurchaseOrder[];
  providerReferrals: ProviderReferral[];
};
