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
  customerPaidCredits?: number;
  customerPaymentAt?: string;
  escrowPaidAmount?: number;
  escrowServiceFee?: number;
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
  negotiation?: OfferNegotiationEntry[];
  customerAgreedAt?: string;
  providerAgreedAt?: string;
};

export type OfferNegotiationEntry = {
  from: "customer" | "provider";
  price: number;
  message: string;
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
  district?: string;
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
  /** Borç kredi hattı aktifleştirildi (ödeme yapılana kadar tekrar açılamaz) */
  borcKredisiAktif?: boolean;
  iban?: string;
  accountHolder?: string;
  /** Param Güvende'den ustaya aktarılan TL bakiyesi */
  escrowBalanceTl?: number;
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
  referredName: string;
  categorySlug: string;
  serviceSlugs: string[];
  referredProviderId?: string;
  creditsAwarded: number;
  createdAt: string;
};

export type CustomerProfile = {
  phone: string;
  city: string;
  district: string;
};

export type CustomerWallet = {
  id: string;
  phone: string;
  creditBalance: number;
  city?: string;
  district?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProviderOfferWithQuote = {
  offer: ProviderOffer;
  quote: {
    id: string;
    serviceName: string;
    city: string;
    district: string;
    status: QuoteRequest["status"];
    createdAt: string;
  };
  escrowStatus: "pending" | "completed" | "failed" | null;
  escrowReleaseStatus?: "none" | "requested" | "released" | null;
};

export type CustomerCreditPurchaseOrder = {
  id: string;
  walletId: string;
  packageSlug: string;
  packageName: string;
  credits: number;
  amount: number;
  conversationId: string;
  basketId: string;
  status: "pending" | "completed" | "failed";
  iyzicoToken?: string;
  iyzicoPaymentId?: string;
  createdAt: string;
  completedAt?: string;
};

export type CustomerProviderPayment = {
  id: string;
  quoteRequestId: string;
  offerId: string;
  walletId: string;
  providerId: string;
  credits: number;
  tlEquivalent: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
};

export type CustomerJobEscrowOrder = {
  id: string;
  quoteRequestId: string;
  offerId: string;
  customerPhone: string;
  providerId: string;
  jobAmount: number;
  serviceFee: number;
  totalAmount: number;
  conversationId: string;
  basketId: string;
  status: "pending" | "completed" | "failed";
  releaseStatus: "none" | "requested" | "released";
  iyzicoToken?: string;
  iyzicoPaymentId?: string;
  createdAt: string;
  completedAt?: string;
  releaseRequestedAt?: string;
  releasedAt?: string;
};

export type ProviderInboxMessage = {
  id: string;
  providerId: string;
  type: string;
  title: string;
  body: string;
  quoteRequestId?: string;
  read: boolean;
  createdAt: string;
};

export type ProviderPayoutRequest = {
  id: string;
  providerId: string;
  period: string;
  creditsRequested: number;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  status: "pending" | "approved" | "paid" | "rejected" | "cancelled";
  iban?: string;
  accountHolder?: string;
  adminNote?: string;
  requestedAt: string;
  processedAt?: string;
};

export type CreditLedgerEntry = {
  id: string;
  type: string;
  creditsDelta: number;
  tlAmount?: number;
  customerWalletId?: string;
  providerId?: string;
  quoteRequestId?: string;
  referenceId?: string;
  description: string;
  period: string;
  createdAt: string;
};

export type CreditSettlementSummary = {
  period: string;
  periodLabel: string;
  customerPurchasesTl: number;
  customerPaymentsCredits: number;
  providerOfferSpend: number;
  payoutCredits: number;
  payoutNetTl: number;
  payoutFeesTl: number;
  entryCount: number;
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
  customerPinHashes?: Record<string, string>;
  customerProfiles?: Record<string, { city: string; district?: string }>;
};
