/** DB hatasında sayfanın 500 vermemesi için güvenli sarmalayıcı */
export async function safeDbCall<T>(fn: () => Promise<T>, fallback: T, label?: string): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(label ? `[safeDbCall] ${label}` : "[safeDbCall]", error);
    return fallback;
  }
}
