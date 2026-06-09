/**
 * Lemon Squeezy API test — kullanım:
 *   $env:LEMONSQUEEZY_API_KEY="..." ; node scripts/test-lemon-api.mjs
 *   $env:LEMONSQUEEZY_STORE_ID="..." ; $env:LEMONSQUEEZY_VARIANT_KONTOR_5="..." ; node scripts/test-lemon-api.mjs --checkout
 */

const API = "https://api.lemonsqueezy.com/v1";
const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim();
const variantId = process.env.LEMONSQUEEZY_VARIANT_KONTOR_5?.trim();
const wantCheckout = process.argv.includes("--checkout");

if (!apiKey) {
  console.error("LEMONSQUEEZY_API_KEY gerekli.");
  process.exit(1);
}

const headers = {
  Accept: "application/vnd.api+json",
  "Content-Type": "application/vnd.api+json",
  Authorization: `Bearer ${apiKey}`,
};

async function apiGet(path) {
  const res = await fetch(`${API}${path}`, { headers });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json.errors?.map((e) => e.detail ?? e.title).join(" · ") || res.statusText,
    );
  }
  return json;
}

async function main() {
  console.log("=== Lemon Squeezy API test ===\n");

  const stores = await apiGet("/stores");
  const storeList = stores.data ?? [];
  console.log(`Mağazalar (${storeList.length}):`);
  for (const s of storeList) {
    console.log(`  - id=${s.id} slug=${s.attributes?.slug} name=${s.attributes?.name}`);
  }

  const preferredSlug = (process.env.LEMONSQUEEZY_STORE_SLUG || "cokusta").toLowerCase();
  const preferredStore = storeList.find(
    (s) => String(s.attributes?.slug ?? "").toLowerCase() === preferredSlug,
  );
  const useStoreId = storeId || preferredStore?.id || storeList[0]?.id;
  if (!useStoreId) {
    console.error("\nMağaza bulunamadı.");
    process.exit(1);
  }
  console.log(`\nKullanılan store_id: ${useStoreId}`);

  const products = await apiGet(`/products?filter[store_id]=${useStoreId}`);
  const productList = products.data ?? [];
  console.log(`\nÜrünler (${productList.length}):`);
  for (const p of productList) {
    console.log(`  - product id=${p.id} name=${p.attributes?.name}`);
    const variants = await apiGet(`/variants?filter[product_id]=${p.id}`);
    for (const v of variants.data ?? []) {
      const price = v.attributes?.price;
      const name = v.attributes?.name;
      console.log(
        `      variant id=${v.id} name=${name} price=${price} test=${v.attributes?.is_subscription ?? false}`,
      );
    }
  }

  if (!wantCheckout) {
    console.log("\nCheckout denemek için --checkout ve LEMONSQUEEZY_VARIANT_KONTOR_5 ekleyin.");
    return;
  }

  const useVariantId = variantId;
  if (!useVariantId) {
    console.error("\nLEMONSQUEEZY_VARIANT_KONTOR_5 gerekli (--checkout için).");
    process.exit(1);
  }

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_options: { embed: true, media: true, logo: true },
        checkout_data: {
          custom: {
            order_type: "provider_credit",
            order_id: "test-order",
            conversation_id: "test-conv-" + Date.now(),
            provider_id: "test-provider",
            user_id: "test-provider",
            userId: "test-provider",
            package_slug: "kontor-5",
          },
        },
        product_options: {
          name: "5 Kontör Paketi (Test)",
          description: "Çokusta API test checkout",
          redirect_url: "https://www.cokusta.com/usta/kontor/sonuc?status=success",
        },
        test_mode: true,
      },
      relationships: {
        store: { data: { type: "stores", id: String(useStoreId) } },
        variant: { data: { type: "variants", id: String(useVariantId) } },
      },
    },
  };

  const res = await fetch(`${API}/checkouts`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("\nCheckout HATA:", json.errors?.map((e) => e.detail).join(" · ") || res.status);
    process.exit(1);
  }

  console.log("\n=== Checkout OK ===");
  console.log("checkout_id:", json.data?.id);
  console.log("checkout_url:", json.data?.attributes?.url);
}

main().catch((err) => {
  console.error("HATA:", err.message);
  process.exit(1);
});
