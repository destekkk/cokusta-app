/**
 * Tam akış E2E testi: müşteri talebi → admin onay → usta teklifi → pazarlık → anlaşma
 * Kullanım: node scripts/e2e-flow-test.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? "http://localhost:3000";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Btl.2012";
const PIN = "5678";

const suffix = String(Date.now()).slice(-7);
const CUSTOMER_PHONE = `532${suffix}`;
const PROVIDER_PHONE = `533${suffix}`;
const CITY = "İstanbul";

const jar = new Map();

function parseCookies(res) {
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  if (raw.length === 0) {
    const single = res.headers.get("set-cookie");
    if (single) raw.push(single);
  }
  for (const c of raw) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(jar.size ? { Cookie: cookieHeader() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  parseCookies(res);
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 200) };
  }
  return { status: res.status, data };
}

function ok(step, res, extra = "") {
  const pass = res.status >= 200 && res.status < 300;
  console.log(`${pass ? "✓" : "✗"} ${step} [${res.status}]${extra ? " — " + extra : ""}`);
  if (!pass) console.log("  ", JSON.stringify(res.data)?.slice(0, 300));
  return pass;
}

async function main() {
  console.log(`\n=== E2E Akış Testi — ${BASE} ===\n`);
  console.log(`Müşteri: ${CUSTOMER_PHONE} | Usta: ${PROVIDER_PHONE}\n`);

  // 1. Müşteri teklif talebi
  let r = await api("POST", "/api/teklif", {
    serviceSlug: "ev-temizligi",
    city: CITY,
    district: "Kadıköy",
    name: "Test Müşteri",
    phone: CUSTOMER_PHONE,
    email: "test@musteri.com",
    notes: "Robot testi — ev temizliği için detaylı açıklama metni.",
    answers: { size: "2+1" },
  });
  if (!ok("1. Teklif talebi oluştur", r)) process.exit(1);
  const quoteId = r.data.id;
  console.log(`   quoteId: ${quoteId}\n`);

  // 2. Admin giriş
  r = await api("POST", "/api/admin/login", { password: ADMIN_PASSWORD });
  if (!ok("2. Admin giriş", r)) process.exit(1);

  // 3. Admin talebi onayla (open)
  r = await api("PATCH", `/api/admin/teklif/${quoteId}`, { status: "open" });
  if (!ok("3. Admin talep onayı (open)", r)) process.exit(1);

  // 4. Admin usta oluştur
  r = await api("POST", "/api/admin/usta", {
    name: "Test Usta",
    phone: PROVIDER_PHONE,
    email: "test@usta.com",
    city: CITY,
    categorySlugs: ["temizlik"],
    experience: "10 yıl",
    bio: "Robot test usta profili",
    status: "approved",
  });
  if (!ok("4. Admin usta oluştur", r)) process.exit(1);
  const providerId = r.data.provider?.id;
  console.log(`   providerId: ${providerId}\n`);

  // 5. Usta şifre belirle + giriş
  jar.clear();
  r = await api("POST", "/api/usta/sifre-belirle", {
    phone: PROVIDER_PHONE,
    pin: PIN,
    pinConfirm: PIN,
  });
  if (!ok("5. Usta şifre belirle", r)) process.exit(1);

  r = await api("POST", "/api/usta/giris", { phone: PROVIDER_PHONE, pin: PIN });
  if (!ok("6. Usta giriş", r)) process.exit(1);

  // 6. Usta teklif ver
  r = await api("POST", "/api/usta/teklif", {
    quoteRequestId: quoteId,
    price: 5000,
    message: "5000 TL ye temizlik yapabilirim, malzeme dahil.",
  });
  if (!ok("7. Usta fiyat teklifi", r)) process.exit(1);
  const offerId = r.data.offer?.id;
  console.log(`   offerId: ${offerId}\n`);

  // 7. Müşteri şifre + giriş
  jar.clear();
  r = await api("POST", "/api/musteri/sifre-belirle", {
    phone: CUSTOMER_PHONE,
    pin: PIN,
    pinConfirm: PIN,
  });
  if (!ok("8. Müşteri şifre belirle", r)) process.exit(1);

  r = await api("POST", "/api/musteri/giris", { phone: CUSTOMER_PHONE, pin: PIN });
  if (!ok("9. Müşteri giriş", r)) process.exit(1);

  r = await api("GET", "/api/musteri/talepler");
  if (!ok("10. Müşteri talep listesi", r, `${r.data?.quotes?.length ?? 0} talep`)) process.exit(1);

  r = await api("GET", `/api/musteri/teklif/${quoteId}/teklifler`);
  if (!ok("11. Müşteri teklifleri gör", r, `${r.data?.offers?.length ?? 0} teklif`)) process.exit(1);

  // 8. Müşteri karşı teklif
  r = await api("POST", `/api/musteri/teklif/${quoteId}/pazarlik`, {
    offerId,
    action: "counter",
    price: 4500,
    message: "4500 TL ye anlaşabilir miyiz? Cumartesi uygun.",
  });
  if (!ok("12. Müşteri karşı teklif", r)) process.exit(1);

  // 9. Usta anlaştık
  jar.clear();
  r = await api("POST", "/api/usta/giris", { phone: PROVIDER_PHONE, pin: PIN });
  if (!ok("13. Usta yeniden giriş", r)) process.exit(1);

  r = await api("POST", "/api/usta/teklif/pazarlik", { offerId, action: "agree" });
  if (!ok("14. Usta Anlaştık", r)) process.exit(1);

  // 10. Müşteri anlaştık → kabul
  jar.clear();
  r = await api("POST", "/api/musteri/giris", { phone: CUSTOMER_PHONE, pin: PIN });
  if (!ok("15. Müşteri yeniden giriş", r)) process.exit(1);

  r = await api("POST", `/api/musteri/teklif/${quoteId}/pazarlik`, { offerId, action: "agree" });
  if (!ok("16. Müşteri Anlaştık (kabul)", r, r.data?.accepted ? "accepted" : "")) process.exit(1);

  // 11. Usta bilgileri görünür mü?
  r = await api("GET", `/api/musteri/teklif/${quoteId}/teklifler`);
  const hasContacts =
    r.data?.contacts?.provider?.phone &&
    r.data?.quote?.status === "accepted";
  console.log(
    `${hasContacts ? "✓" : "✗"} 17. Müşteri usta iletişim bilgisi [${r.status}]`,
    hasContacts
      ? `— tel: ${r.data.contacts.provider.phone}, usta: ${r.data.contacts.provider.name}`
      : ""
  );
  if (!hasContacts) {
    console.log("   ", JSON.stringify(r.data)?.slice(0, 400));
    process.exit(1);
  }

  console.log("\n=== TÜM ADIMLAR BAŞARILI ===\n");
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
