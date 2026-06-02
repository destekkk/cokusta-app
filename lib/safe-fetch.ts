export async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    if (res.status === 504 || res.status === 502) {
      throw new Error("Sunucu zaman aşımına uğradı. Lütfen tekrar deneyin.");
    }
    throw new Error(`Sunucu yanıt vermedi (${res.status}).`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Sunucu yanıtı okunamadı.");
  }
}
