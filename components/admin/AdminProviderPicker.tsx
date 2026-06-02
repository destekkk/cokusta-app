"use client";

import { useMemo, useState } from "react";
import type { ProviderRegistration } from "@/lib/types";

type Props = {
  providers: ProviderRegistration[];
  value: string;
  onChange: (id: string) => void;
};

export default function AdminProviderPicker({ providers, value, onChange }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return providers.slice(0, 80);
    return providers
      .filter(
        (p) =>
          p.name.toLocaleLowerCase("tr-TR").includes(q) ||
          p.city.toLocaleLowerCase("tr-TR").includes(q) ||
          p.phone.includes(q)
      )
      .slice(0, 80);
  }, [providers, query]);

  if (providers.length === 0) {
    return <span className="text-sm text-muted-foreground">Onaylı usta yok</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Usta ara (ad, şehir)…"
        className="w-44 rounded-lg border border-border px-2 py-2 text-sm sm:w-52"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[220px] rounded-lg border border-border px-2 py-2 text-sm"
      >
        {filtered.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.city}
          </option>
        ))}
      </select>
    </div>
  );
}
