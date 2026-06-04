import { NextResponse } from "next/server";

/** Admin API yanıtı — tam layout revalidate kaldırıldı (panel yavaşlatıyordu). */
export function adminMutationJson<T extends object>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, init);
}
