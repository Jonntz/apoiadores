/**
 * Conversion signal for the traffic team.
 *
 * The form confirms in place (SuccessModal) instead of navigating to
 * /obrigado, so there is no thank-you pageview to count. This reports the lead
 * as a GA4 event instead.
 *
 * It calls gtag() rather than pushing an object onto window.dataLayer, because
 * the site runs gtag.js directly (see app/layout.tsx), not a GTM container.
 * The two read the same array differently: GTM listens for objects carrying an
 * `event` key, while gtag.js treats the array as a queue of `arguments` objects
 * and ignores anything else. A plain push would therefore never reach GA4.
 *
 * One signal only. If a GTM container is ever added on top, this stays as it is
 * and the container triggers off the same event — firing a second, separate
 * signal here would double-count every lead.
 *
 * No personal data in the payload: the dataLayer is readable by every tag on
 * the page, and a name plus a phone number is exactly what should not be handed
 * to third parties. The spreadsheet holds the identifying data.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** GA4 measurement ID. Override per environment without touching the code. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-EPPF1NZDSD';

/**
 * Event name reported to GA4. To make it count as a conversion, mark it as a
 * key event in GA4 (Admin → Events) — collecting it is not the same as counting
 * it.
 */
export const CONVERSION_EVENT = 'cadastro_apoiador';

export function trackSignupConversion(): void {
  if (typeof window === 'undefined') return;
  // The inline snippet defines window.gtag synchronously, before the library
  // itself arrives, and queues whatever is sent meanwhile. So this lands even
  // if gtag.js is still in flight — and no-ops safely if it never loads.
  window.gtag?.('event', CONVERSION_EVENT);
}
