import type { FieldErrors, SupporterFields } from './validation';

/**
 * Kept out of app/actions.ts on purpose: every export of a 'use server' module
 * is turned into a server reference, so a plain constant living there would be
 * shipped to the client as a callable and blow up on first render.
 */
export type FormState = {
  /**
   * 'success' and 'duplicate' both open the confirmation modal over the landing
   * page; they are kept apart because only 'success' wrote a new row, and so
   * only 'success' is a conversion worth reporting to the ads platform.
   */
  status: 'idle' | 'invalid' | 'error' | 'success' | 'duplicate';
  message?: string;
  errors?: FieldErrors;
  /** Echoed back so a no-JS submit re-renders with the values still filled in. */
  values?: Partial<Record<keyof SupporterFields, string>>;
};

export const INITIAL_FORM_STATE: FormState = { status: 'idle' };
