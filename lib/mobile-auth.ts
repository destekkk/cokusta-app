import { cookies } from "next/headers";
import { PROVIDER_COOKIE, parseProviderSessionToken } from "@/lib/provider-session";

/** Web çerezi veya mobil Bearer token ile usta oturumu. */
export async function getProviderSessionIdFromRequest(
  request?: Request
): Promise<string | null> {
  if (request) {
    const auth = request.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      return parseProviderSessionToken(auth.slice(7).trim());
    }
  }

  const cookieStore = await cookies();
  return parseProviderSessionToken(cookieStore.get(PROVIDER_COOKIE)?.value);
}
