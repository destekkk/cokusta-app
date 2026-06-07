/** Lemon Squeezy resmi lemon.js — checkout overlay */

export const LEMON_SCRIPT_SRC = "https://app.lemonsqueezy.com/js/lemon.js";
export const LEMON_BUTTON_CLASS = "lemonsqueezy-button";

type LemonEvent = { event: string };

declare global {
  interface Window {
    LemonSqueezy?: {
      Setup?: (config: { eventHandler?: (event: LemonEvent) => void }) => void;
      Url?: { Open?: (url: string) => void };
    };
    createLemonSqueezy?: () => void;
  }
}

let scriptPromise: Promise<void> | null = null;
let setupDone = false;
let closeHandler: (() => void) | null = null;

function setupLemonEvents() {
  if (setupDone || typeof window === "undefined") return;
  window.LemonSqueezy?.Setup?.({
    eventHandler: (event) => {
      if (event.event === "Checkout.Close") closeHandler?.();
    },
  });
  setupDone = true;
}

/** lemon.js tek sefer yüklenir */
export function loadLemonSqueezyScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.LemonSqueezy) {
    setupLemonEvents();
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${LEMON_SCRIPT_SRC}"]`);
    if (existing) {
      const done = () => {
        setupLemonEvents();
        resolve();
      };
      if (window.LemonSqueezy) done();
      else existing.addEventListener("load", done, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = LEMON_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      setupLemonEvents();
      resolve();
    };
    script.onerror = () => reject(new Error("Lemon Squeezy script yüklenemedi."));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

/** API veya variant checkout URL ile overlay açar; başarısızsa tam sayfa yönlendirir */
export async function openLemonCheckout(
  checkoutUrl: string,
  options?: { onClose?: () => void },
): Promise<void> {
  if (!checkoutUrl.trim()) throw new Error("Checkout adresi boş.");

  closeHandler = options?.onClose ?? null;

  try {
    await loadLemonSqueezyScript();

    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(checkoutUrl);
      return;
    }

    const link = document.createElement("a");
    link.href = checkoutUrl;
    link.className = LEMON_BUTTON_CLASS;
    link.style.display = "none";
    link.setAttribute("aria-hidden", "true");
    document.body.appendChild(link);
    window.createLemonSqueezy?.();
    link.click();
    document.body.removeChild(link);
  } catch {
    window.location.assign(checkoutUrl);
  }
}
