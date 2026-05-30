"use client";

export default function PrintButton({ label = "Yazdır / PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
    >
      {label}
    </button>
  );
}
