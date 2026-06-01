import { NextResponse } from "next/server";
import {
  getProviderInboxMessages,
  getProviderUnreadMessageCount,
  markProviderMessagesRead,
} from "@/lib/db-inbox";
import { requireApprovedProviderApi } from "@/lib/provider-guard";
import { isDatabaseEnabled } from "@/lib/db/config";

export async function GET() {
  const auth = await requireApprovedProviderApi();
  if (auth instanceof NextResponse) return auth;

  if (!isDatabaseEnabled()) {
    return NextResponse.json({ messages: [], unreadCount: 0 });
  }

  const [messages, unreadCount] = await Promise.all([
    getProviderInboxMessages(auth.providerId),
    getProviderUnreadMessageCount(auth.providerId),
  ]);

  return NextResponse.json({ messages, unreadCount });
}

export async function PATCH(request: Request) {
  const auth = await requireApprovedProviderApi();
  if (auth instanceof NextResponse) return auth;

  if (!isDatabaseEnabled()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? (body.ids as string[]) : undefined;
    await markProviderMessagesRead(auth.providerId, ids);
    const unreadCount = await getProviderUnreadMessageCount(auth.providerId);
    return NextResponse.json({ ok: true, unreadCount });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
