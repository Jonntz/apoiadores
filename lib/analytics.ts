/**
 * Conversion signals for the traffic team.
 *
 * The form confirms in place (SuccessModal) instead of navigating to
 * /obrigado, so there is no thank-you pageview to count. The lead is reported
 * as an event to each ad platform instead.
 *
 * Two platforms, two calls — GA4 and the Meta Pixel are independent and neither
 * can see the other's events, so this is one signal each, not a double count.
 * What *would* double-count is adding a GTM container that also triggers off
 * these same events; if that ever happens, the firing moves into the container
 * and comes out of here.
 *
 * GA4 is called through gtag(), not by pushing an object onto window.dataLayer,
 * because the site runs gtag.js directly (see app/layout.tsx), not GTM. The two
 * read the same array differently: GTM listens for objects carrying an `event`
 * key, while gtag.js treats the array as a queue of `arguments` objects and
 * ignores anything else. A plain push would never reach GA4.
 *
 * No personal data in either payload: the dataLayer is readable by every tag on
 * the page, and a name plus a phone number is exactly what should not be handed
 * to third parties. The spreadsheet holds the identifying data.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** GA4 measurement ID. Override per environment without touching the code. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-EPPF1NZDSD';

/** Meta Pixel ID. Same idea — swap it per environment through the env var. */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '1059089453243567';

/**
 * Event name reported to GA4. To make it count as a conversion, mark it as a
 * key event in GA4 (Admin → Events) — collecting it is not the same as counting
 * it.
 */
export const CONVERSION_EVENT = 'cadastro_apoiador';

export function trackSignupConversion(): void {
  if (typeof window === 'undefined') return;

  // Both snippets define their global synchronously, before the library itself
  // arrives, and queue whatever is sent meanwhile. So these land even while the
  // scripts are still in flight — and no-op safely if one never loads.
  window.gtag?.('event', CONVERSION_EVENT);

  // 'Lead' is Meta's standard event for a completed signup. Using the standard
  // name rather than a custom one is what lets it be picked as a conversion
  // objective and be optimised for in Ads Manager.
  window.fbq?.('track', 'Lead');
}
