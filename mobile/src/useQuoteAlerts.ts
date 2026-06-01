import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Vibration } from "react-native";
import * as Notifications from "expo-notifications";
import { fetchNewQuotes, type QuoteSummary } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const POLL_MS = 45_000;

function vibrateAlert() {
  Vibration.vibrate([0, 350, 100, 350, 100, 500]);
}

async function notifyQuote(quote: QuoteSummary) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: quote.urgent ? "Acil talep!" : "Yeni talep var",
      body: `${quote.serviceName} — ${quote.district}`,
      sound: true,
      data: { quoteId: quote.id },
    },
    trigger: null,
  });
}

export function useQuoteAlerts(district: string | null, enabled: boolean) {
  const lastCheckRef = useRef(new Date().toISOString());
  const seenIds = useRef<Set<string>>(new Set());
  const [latestAlert, setLatestAlert] = useState<QuoteSummary | null>(null);

  const check = useCallback(async () => {
    if (!district || !enabled) return;

    try {
      const { newQuotes, serverTime } = await fetchNewQuotes(district, lastCheckRef.current);
      const unseen = newQuotes.filter((q) => !seenIds.current.has(q.id));

      if (unseen.length > 0) {
        for (const quote of unseen) {
          seenIds.current.add(quote.id);
          vibrateAlert();
          await notifyQuote(quote);
          setLatestAlert(quote);
        }
      }

      lastCheckRef.current = serverTime;
    } catch {
      // Sonraki turda tekrar dene
    }
  }, [district, enabled]);

  useEffect(() => {
    if (!district || !enabled) return;

    void Notifications.requestPermissionsAsync();
    void check();

    const interval = setInterval(check, POLL_MS);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void check();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [district, enabled, check]);

  const resetSeen = useCallback(() => {
    seenIds.current.clear();
    lastCheckRef.current = new Date().toISOString();
    setLatestAlert(null);
  }, []);

  return { latestAlert, resetSeen, checkNow: check };
}
