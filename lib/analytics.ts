/**
 * Conversion signal for the traffic team.
 *
 * The form confirms in place (SuccessModal) instead of navigating to
 * /obrigado, so there is no thank-you pageview to count. This pushes the event
 * the tag manager listens for.
 *
 * Deliberately the *only* signal fired: one push, and the container fans it out
 * to Google Ads / Meta / GA4. Calling gtag() or fbq() directly from here as well
 * would double-count every lead on any setup where the container is also
 * listening for this event.
 *
 * No personal data goes in the payload. The dataLayer is readable by every tag
 * loaded on the page, and a name plus a phone number is exactly what should not
 * be handed to third parties. The spreadsheet holds the identifying data.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** GTM trigger name. Changing it means changing the trigger in the container. */
export const CONVERSION_EVENT = 'cadastro_apoiador';

export function trackSignupConversion(): void {
  if (typeof window === 'undefined') return;
  // GTM is designed to be fed before it loads: pushes queue on the array and
  // are replayed when the container initialises. So this works even if the tag
  // is injected later, or not at all.
  (window.dataLayer ??= []).push({ event: CONVERSION_EVENT });
}
