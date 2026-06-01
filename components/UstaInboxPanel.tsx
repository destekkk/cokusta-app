"use client";

import { useEffect, useState } from "react";

type InboxMessage = {
  id: string;
  type: string;
  title: string;
  body: string;
  quoteRequestId?: string;
  read: boolean;
  createdAt: string;
};

export default function UstaInboxPanel() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/usta/bildirimler");
      const data = await res.json();
      if (!res.ok) return;
      setMessages(data.messages ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/usta/bildirimler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await load();
  };

  if (loading) return null;
  if (messages.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">
          Bildirimler
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Tümünü okundu işaretle
          </button>
        )}
      </div>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {messages.slice(0, 5).map((msg) => (
          <li
            key={msg.id}
            className={`rounded-lg px-3 py-2 text-sm ${
              msg.read ? "bg-muted/30 text-muted-foreground" : "bg-primary/5 text-foreground"
            }`}
          >
            <p className="font-medium">{msg.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed">{msg.body}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {new Date(msg.createdAt).toLocaleString("tr-TR")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
