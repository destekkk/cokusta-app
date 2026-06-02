"use client";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  total: number;
  shown: number;
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  children?: React.ReactNode;
};

export default function AdminTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Ara…",
  total,
  shown,
  page = 1,
  pageCount = 1,
  onPageChange,
  children,
}: Props) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-border bg-background py-2 pl-3 pr-3 text-sm"
          />
        </div>
        <p className="shrink-0 text-sm text-muted-foreground">
          {shown === total ? `${total} kayıt` : `${shown} / ${total} kayıt`}
        </p>
      </div>
      {children}
      {onPageChange && pageCount > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            ← Önceki
          </button>
          <span className="text-sm text-muted-foreground">
            Sayfa {page} / {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}
