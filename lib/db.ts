import * as jsonDb from "./db-json";
import { isDatabaseEnabled } from "./db/config";

type DbModule = typeof jsonDb;

let impl: DbModule | null = null;

async function getImpl(): Promise<DbModule> {
  if (impl) return impl;
  impl = isDatabaseEnabled() ? await import("./db-prisma") : jsonDb;
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
export const getProviderOfTheMonthHistory = delegate("getProviderOfTheMonthHistory");
export const getMonthlyLeaderboard = delegate("getMonthlyLeaderboard");
