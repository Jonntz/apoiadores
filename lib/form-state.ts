import type { FieldErrors, SupporterFields } from './validation';

/**
 * Kept out of app/actions.ts on purpose: every export of a 'use server' module
 * is turned into a server reference, so a plain constant living there would be
 * shipped to the client as a callable and blow up on first render.
 */
export type FormState = {
  /** 'success' is what opens the confirmation modal over the landing page. */
  status: 'idle' | 'invalid' | 'error' | 'success';
  message?: string;
  errors?: FieldErrors;
  /** Echoed back so a no-JS submit re-renders with the values still filled in. */
  values?: Partial<Record<keyof SupporterFields, string>>;
};

export const INITIAL_FORM_STATE: FormState = { status: 'idle' };
