"use client";

import { Suspense } from "react";
import UstaCreditShop from "@/components/UstaCreditShop";

type Props = {
  initialBalance: number;
  initialCreditDebt: number;
};

function Shop(props: Props) {
  return <UstaCreditShop {...props} />;
}

export default function UstaCreditShopWrapper(props: Props) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Yükleniyor…</p>}>
      <Shop {...props} />
    </Suspense>
  );
}
