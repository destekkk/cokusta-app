"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Sunucudan gelen listeyi izler; silme/onay sonrası anında UI güncellemesi için setItems kullanın. */
export function useAdminList<T>(serverItems: T[]) {
  const [items, setItems] = useState(serverItems);
  const router = useRouter();

  useEffect(() => {
    setItems(serverItems);
  }, [serverItems]);

  const refreshAdmin = useCallback(async () => {
    router.refresh();
  }, [router]);

  return { items, setItems, refreshAdmin };
}
