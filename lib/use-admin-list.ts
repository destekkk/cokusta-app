"use client";

import { useCallback, useEffect, useState } from "react";

/** Sunucudan gelen listeyi izler; silme/onay sonrası setItems ile anında güncellenir. */
export function useAdminList<T>(serverItems: T[]) {
  const [items, setItems] = useState(serverItems);

  useEffect(() => {
    setItems(serverItems);
  }, [serverItems]);

  /** Eski router.refresh() kaldırıldı — tam sayfa DB yenilemesi paneli yavaşlatıyordu. */
  const refreshAdmin = useCallback(async () => {
    /* no-op: optimistic setItems yeterli */
  }, []);

  return { items, setItems, refreshAdmin };
}
