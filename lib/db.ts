import * as jsonDb from "./db-json";
import { isDatabaseEnabled } from "./db/config";

type DbModule = typeof jsonDb;

let impl: DbModule | null = null;

async function getImpl(): Promise<DbModule> {
  if (impl) return impl;
  impl = (isDatabaseEnabled() ? await import("./db-prisma") : jsonDb) as DbModule;
  return impl;
}

function delegate<K extends keyof DbModule>(method: K): DbModule[K] {
  return ((...args: unknown[]) =>
    getImpl().then((module) => {
      const fn = module[method];
      if (typeof fn !== "function") return fn;
      return (fn as (...a: unknown[]) => unknown).apply(module, args);
    })) as DbModule[K];
}

export const getLaunchCampaignStats = delegate("getLaunchCampaignStats");
export const createQuoteRequest = delegate("createQuoteRequest");
export const getUrgentQuoteRequests = delegate("getUrgentQuoteRequests");
export const createProviderRegistration = delegate("createProviderRegistration");
export const getQuoteRequestById = delegate("getQuoteRequestById");
export const getAllQuoteRequests = delegate("getAllQuoteRequests");
export const getAllProviders = delegate("getAllProviders");
export const getProviderById = delegate("getProviderById");
export const updateQuoteRequestStatus = delegate("updateQuoteRequestStatus");
export const updateProviderStatus = delegate("updateProviderStatus");
export const updateProvider = delegate("updateProvider");
export const createProviderAdmin = delegate("createProviderAdmin");
export const deleteProvider = delegate("deleteProvider");
export const getCustomerById = delegate("getCustomerById");
export const createCustomer = delegate("createCustomer");
export const updateCustomer = delegate("updateCustomer");
export const updateCustomerByKey = delegate("updateCustomerByKey");
export const deleteCustomer = delegate("deleteCustomer");
export const deleteCustomerByKey = delegate("deleteCustomerByKey");
export const getCustomerSummaries = delegate("getCustomerSummaries");
export const getProviderSummaries = delegate("getProviderSummaries");
export const addProviderPlatformPurchase = delegate("addProviderPlatformPurchase");
export const getApprovedProviders = delegate("getApprovedProviders");
export const findApprovedProviderByPhone = delegate("findApprovedProviderByPhone");
export const findProviderByPhone = delegate("findProviderByPhone");
export const getApprovedProviderAuthByPhone = delegate("getApprovedProviderAuthByPhone");
export const setProviderPinIfUnset = delegate("setProviderPinIfUnset");
export const addProviderPortfolioItem = delegate("addProviderPortfolioItem");
export const removeProviderPortfolioItem = delegate("removeProviderPortfolioItem");
export const getRecentPortfolioItems = delegate("getRecentPortfolioItems");
export const getPortfolioByService = delegate("getPortfolioByService");
export const getPublicProviderProfile = delegate("getPublicProviderProfile");
export const getAllInvoices = delegate("getAllInvoices");
export const getInvoiceById = delegate("getInvoiceById");
export const getTaxDeclarationById = delegate("getTaxDeclarationById");
export const getBillableItems = delegate("getBillableItems");
export const createInvoiceForQuote = delegate("createInvoiceForQuote");
export const createInvoiceForPurchase = delegate("createInvoiceForPurchase");
export const createAllPendingInvoices = delegate("createAllPendingInvoices");
export const createTaxDeclaration = delegate("createTaxDeclaration");
export const getBillingOverview = delegate("getBillingOverview");
export const getStats = delegate("getStats");
export const getAdminStats = delegate("getAdminStats");
export const getAllCertificates = delegate("getAllCertificates");
export const getCertificateById = delegate("getCertificateById");
export const getProviderCertificates = delegate("getProviderCertificates");
export const verifyCertificateChain = delegate("verifyCertificateChain");
export const issueProviderCertificate = delegate("issueProviderCertificate");
export const selectProviderOfTheMonth = delegate("selectProviderOfTheMonth");
export const getCurrentProviderOfTheMonth = delegate("getCurrentProviderOfTheMonth");
export const getAcceptedContactDetails = delegate("getAcceptedContactDetails");
export const getOpenQuotesForProvider = delegate("getOpenQuotesForProvider");
export const submitProviderOffer = delegate("submitProviderOffer");
export const getOffersForQuoteRequest = delegate("getOffersForQuoteRequest");
export const getProviderOffersForQuote = delegate("getProviderOffersForQuote");
export const acceptProviderOffer = delegate("acceptProviderOffer");
export const getQuoteOfferCounts = delegate("getQuoteOfferCounts");
export const deleteDemoQuoteRequests = delegate("deleteDemoQuoteRequests");
export const adminMatchQuoteToProvider = delegate("adminMatchQuoteToProvider");
export const autoMatchQuote = delegate("autoMatchQuote");
export const bulkAdminQuoteAction = delegate("bulkAdminQuoteAction");
export const autoMatchQuotes = delegate("autoMatchQuotes");
export const createCreditPurchaseOrder = delegate("createCreditPurchaseOrder");
export const setCreditPurchaseToken = delegate("setCreditPurchaseToken");
export const getCreditPurchaseOrderById = delegate("getCreditPurchaseOrderById");
export const getCreditPurchaseOrderByConversationId = delegate("getCreditPurchaseOrderByConversationId");
export const fulfillCreditPurchaseOrder = delegate("fulfillCreditPurchaseOrder");
export const failCreditPurchaseOrder = delegate("failCreditPurchaseOrder");
export const submitProviderReferral = delegate("submitProviderReferral");
export const getProviderReferrals = delegate("getProviderReferrals");
export const getProviderOfTheMonthHistory = delegate("getProviderOfTheMonthHistory");
export const getMonthlyLeaderboard = delegate("getMonthlyLeaderboard");
