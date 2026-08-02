/**
 * Neo Sans has no U+2192, so the CTA arrow is drawn. Rendering it as a module
 * constant means React reuses one element for every button instead of building
 * the tree again per call site.
 */
export const Arrow = (
  <svg
    className="btn__arrow"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 10h13M11 5l5 5-5 5" />
  </svg>
);
