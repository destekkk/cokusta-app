/** Build sırasında DB'ye bağlanma — Vercel build timeout'unu önler */
export function isDatabaseEnabled(): boolean {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return false;
  }
  return Boolean(process.env.DATABASE_URL?.trim());
}
