'use client';

import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { registerSupporter } from '@/app/actions';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/form-state';
import {
  FIELD_NAMES,
  HELP_OPTIONS,
  formatWhatsapp,
  validateField,
  type FieldErrors,
  type SupporterFields,
} from '@/lib/validation';
import { Arrow } from './Arrow';
import { SuccessModal } from './SuccessModal';
import styles from './SupporterForm.module.css';

/** Shared with FloatingCta, which hides itself while the card is on screen. */
export const SIGNUP_FORM_ID = 'cadastro-form';

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

/** Static, so it is built once rather than on every keystroke. */
const HIDDEN_FIELDS = (
  <>
    {UTM_KEYS.map((key) => (
      <input key={key} type="hidden" name={key} defaultValue="" />
    ))}
    <input type="hidden" name="referrer" defaultValue="" />
    <input type="hidden" name="openedAt" defaultValue="" />
  </>
);

/**
 * Attribution + the anti-spam timestamp. Written straight to the DOM: these
 * never render, so putting them in state would only cost a re-render.
 */
function primeMetadata(form: HTMLFormElement) {
  const params = new URLSearchParams(window.location.search);
  const set = (name: string, value: string) => {
    const element = form.elements.namedItem(name);
    if (element instanceof HTMLInputElement) element.value = value;
  };

  for (const key of UTM_KEYS) set(key, params.get(key) ?? '');
  set('referrer', document.referrer);
  set('openedAt', String(Date.now()));
}

const TEXT_FIELDS = [
  { name: 'nome', label: 'Nome completo', type: 'text', autoComplete: 'name' },
  { name: 'whatsapp', label: 'Whatsapp (com DDD)', type: 'tel', autoComplete: 'tel-national' },
  { name: 'cidade', label: 'Cidade', type: 'text', autoComplete: 'address-level2' },
] as const;

export function SupporterForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    registerSupporter,
    INITIAL_FORM_STATE,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [whatsapp, setWhatsapp] = useState(state.values?.whatsapp ?? '');
  const [ajuda, setAjuda] = useState(state.values?.ajuda ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dismissed, setDismissed] = useState(false);

  // Both statuses confirm; only 'duplicate' means nothing new was written.
  const confirmed = state.status === 'success' || state.status === 'duplicate';

  // Adopt the server's verdict the moment a new response lands. Doing it during
  // render (rather than in an effect) means the corrected UI paints in the same
  // commit, with no flash of the previous errors.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    setErrors(state.errors ?? {});
    // A fresh submit re-opens the panel even if the last one was dismissed.
    setDismissed(false);
    if (confirmed) {
      // The text inputs are uncontrolled and get cleared by form.reset() below;
      // these two are React-controlled, so they have to be cleared here.
      setWhatsapp('');
      setAjuda('');
    }
  }

  const dismiss = useCallback(() => setDismissed(true), []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    // Runs on mount and after every confirmed submit. Deliberately skipped on
    // invalid/error: re-priming openedAt there would restart the anti-spam
    // window, so a quick correction would look like a bot and be discarded.
    if (state.status === 'invalid' || state.status === 'error') return;

    // Clears the card behind the panel so the next person on this phone — at a
    // rally, at a table — starts blank instead of editing someone else's answers.
    if (confirmed) form.reset();

    // reset() restores the hidden inputs to their empty defaults too, so
    // attribution is written after it, never before.
    primeMetadata(form);
  }, [state, confirmed]);

  const checkField = (field: keyof SupporterFields, value: string) => {
    setErrors((current) => ({ ...current, [field]: validateField(field, value) }));
  };

  const hasErrors = FIELD_NAMES.some((field) => errors[field]);

  return (
    <form
      ref={formRef}
      id={SIGNUP_FORM_ID}
      action={formAction}
      className={styles.card}
      data-invalid={hasErrors || state.status === 'invalid' || state.status === 'error'}
      noValidate
    >
      {/* Rendered from the form so it also appears on a no-JS submit, where the
          server re-renders the page carrying the success status. */}
      {confirmed && !dismissed ? (
        <SuccessModal onClose={dismiss} returning={state.status === 'duplicate'} />
      ) : null}

      <h3 className={styles.title}>Quero fazer parte</h3>
      <p className={styles.subtitle}>Preencha e receba o convite</p>

      {state.message ? (
        <p className={styles.alert} role="alert">
          {state.message}
        </p>
      ) : null}

      {TEXT_FIELDS.map((field) => {
        const isWhatsapp = field.name === 'whatsapp';
        return (
          <div className={styles.field} key={field.name}>
            <label className="visually-hidden" htmlFor={field.name}>
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              className={styles.control}
              type={field.type}
              placeholder={field.label}
              autoComplete={field.autoComplete}
              enterKeyHint="next"
              disabled={isPending}
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={errors[field.name] ? `${field.name}-erro` : undefined}
              {...(isWhatsapp
                ? {
                    inputMode: 'numeric' as const,
                    maxLength: 16,
                    value: whatsapp,
                    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                      setWhatsapp(formatWhatsapp(event.target.value)),
                  }
                : // Explicitly '' rather than undefined: this is also what
                  // form.reset() restores the field to after a confirmed submit.
                  { defaultValue: state.values?.[field.name] ?? '' })}
              onBlur={(event) => checkField(field.name, event.target.value)}
            />
            {errors[field.name] ? (
              <p className={styles.error} id={`${field.name}-erro`}>
                {errors[field.name]}
              </p>
            ) : null}
          </div>
        );
      })}

      <div className={styles.field}>
        <label className="visually-hidden" htmlFor="ajuda">
          Como você quer ajudar?
        </label>
        <select
          id="ajuda"
          name="ajuda"
          className={`${styles.control} ${styles.select}`}
          value={ajuda}
          data-empty={ajuda === '' ? 'true' : undefined}
          disabled={isPending}
          aria-invalid={errors.ajuda ? true : undefined}
          aria-describedby={errors.ajuda ? 'ajuda-erro' : undefined}
          onChange={(event) => {
            setAjuda(event.target.value);
            checkField('ajuda', event.target.value);
          }}
          onBlur={(event) => checkField('ajuda', event.target.value)}
        >
          <option value="" disabled>
            Como você quer ajudar?
          </option>
          {HELP_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.ajuda ? (
          <p className={styles.error} id="ajuda-erro">
            {errors.ajuda}
          </p>
        ) : null}
      </div>

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {HIDDEN_FIELDS}

      <button className={`btn btn--block ${styles.submit}`} type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <span className={styles.spinner} />
            Enviando seu cadastro...
          </>
        ) : (
          <>
            Quero me envolver e ser líder na campanha
            {Arrow}
          </>
        )}
      </button>

      <p className={styles.note} aria-live="polite">
        {isPending
          ? 'Não feche a página. Estamos reservando sua vaga no grupo regional.'
          : 'Seus dados estão 100% seguros. Entraremos em contato via WhatsApp para te direcionar ao grupo regional.'}
      </p>
    </form>
  );
}
