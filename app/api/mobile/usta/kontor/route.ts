import { NextResponse } from "next/server";
import {
  creditPackages,
  formatCreditPrice,
  platformShopPackages,
} from "@/lib/credit-packages";
import { computeCheckoutTotal, computeDebtSettlementAmount } from "@/lib/credit-debt";
import { getProviderById } from "@/lib/db";
import { getProviderSessionIdFromRequest } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  const providerId = await getProviderSessionIdFromRequest(request);
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    return NextResponse.json({ error: "Hesap onaylı değil." }, { status: 403 });
  }

  const creditDebt = provider.creditDebt ?? 0;
  const mapPkg = (pkg: (typeof creditPackages)[0]) => {
    const checkout = computeCheckoutTotal(pkg.price, creditDebt);
    return {
      slug: pkg.slug,
      name: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
      totalAmount: checkout.totalAmount,
      debtAmount: checkout.debtAmount,
      perCredit: pkg.perCredit,
      savingsPercent: pkg.savingsPercent,
      description: pkg.description,
      badge: pkg.badge,
      formattedPrice: formatCreditPrice(
        creditDebt > 0 ? checkout.totalAmount : pkg.price
      ),
    };
  };

  return NextResponse.json({
    creditBalance: provider.creditBalance ?? 0,
    creditDebt,
    debtSettlementFormatted: creditDebt > 0 ? formatCreditPrice(computeDebtSettlementAmount(creditDebt)) : null,
    packages: creditPackages.filter((p) => p.credits > 1).map(mapPkg),
    singlePackage: creditPackages.find((p) => p.slug === "kontor-tek")
      ? mapPkg(creditPackages.find((p) => p.slug === "kontor-tek")!)
      : null,
    platformPackages: platformShopPackages.map((pkg) => ({
      slug: pkg.slug,
      name: pkg.name,
      price: pkg.price,
      description: pkg.description,
      formattedPrice: formatCreditPrice(pkg.price),
      unitLabel: pkg.unitLabel,
    })),
  });
}
