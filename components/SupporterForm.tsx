'use client';

import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { registerSupporter } from '@/app/actions';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/form-state';
import {
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

export function SupporterForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    registerSupporter,
    INITIAL_FORM_STATE,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [whatsapp, setWhatsapp] = useState(state.values?.whatsapp ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dismissed, setDismissed] = useState(false);

  // Adopt the server's verdict the moment a new response lands. Doing it during
  // render (rather than in an effect) means the corrected UI paints in the same
  // commit, with no flash of the previous errors.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    setErrors(state.errors ?? {});
    setDismissed(false);
  }

  // Attribution + the anti-spam timestamp. Written straight to the DOM: these
  // never render, so putting them in state would only cost a re-render. Re-run
  // after a reset(), which puts the hidden inputs back to their empty default.
  const fillContext = useCallback(() => {
    const form = formRef.current;
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const set = (name: string, value: string) => {
      const element = form.elements.namedItem(name);
      if (element instanceof HTMLInputElement) element.value = value;
    };

    for (const key of UTM_KEYS) set(key, params.get(key) ?? '');
    set('referrer', document.referrer);
    set('openedAt', String(Date.now()));
  }, []);

  useEffect(fillContext, [fillContext]);

  // Clear the card behind the modal: whoever closes it is looking at a form
  // they already submitted, and a second send would only duplicate the row.
  useEffect(() => {
    if (state.status !== 'success') return;
    formRef.current?.reset();
    setWhatsapp('');
    fillContext();
  }, [state, fillContext]);

  const closeModal = useCallback(() => setDismissed(true), []);

  const checkField = (field: keyof SupporterFields, value: string | string[]) => {
    setErrors((current) => ({ ...current, [field]: validateField(field, value) }));
  };

  const describedBy = (field: keyof SupporterFields) =>
    errors[field] ? `${field}-erro` : undefined;

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <>
      {state.status === 'success' && !dismissed ? <SuccessModal onClose={closeModal} /> : null}

      <form
        ref={formRef}
        id={SIGNUP_FORM_ID}
        action={formAction}
        className={styles.card}
        data-invalid={hasErrors || state.status === 'invalid' || state.status === 'error'}
        noValidate
      >
        <div className={styles.cardHead}>
          <h3 className={styles.cardTitle}>Quero fazer parte</h3>
          <p className={styles.cardSub}>Preencha e receba o convite do grupo oficial.</p>
        </div>

        {state.message ? (
          <p className={styles.alert} role="alert">
            {state.message}
          </p>
        ) : null}

        <div className={styles.field}>
          <label className="visually-hidden" htmlFor="nome">
            Nome completo
          </label>
          <input
            id="nome"
            name="nome"
            className={styles.input}
            type="text"
            placeholder="Nome completo"
            autoComplete="name"
            enterKeyHint="next"
            defaultValue={state.values?.nome}
            disabled={isPending}
            aria-invalid={errors.nome ? true : undefined}
            aria-describedby={describedBy('nome')}
            onBlur={(event) => checkField('nome', event.target.value)}
          />
          {errors.nome ? (
            <p className={styles.error} id="nome-erro">
              {errors.nome}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className="visually-hidden" htmlFor="whatsapp">
            WhatsApp com DDD
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            className={styles.input}
            type="tel"
            inputMode="numeric"
            placeholder="WhatsApp (com DDD)"
            autoComplete="tel-national"
            enterKeyHint="next"
            maxLength={16}
            value={whatsapp}
            disabled={isPending}
            aria-invalid={errors.whatsapp ? true : undefined}
            aria-describedby={describedBy('whatsapp')}
            onChange={(event) => setWhatsapp(formatWhatsapp(event.target.value))}
            onBlur={(event) => checkField('whatsapp', event.target.value)}
          />
          {errors.whatsapp ? (
            <p className={styles.error} id="whatsapp-erro">
              {errors.whatsapp}
            </p>
          ) : null}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className="visually-hidden" htmlFor="cidade">
              Sua cidade em MG
            </label>
            <input
              id="cidade"
              name="cidade"
              className={styles.input}
              type="text"
              placeholder="Sua cidade em MG"
              autoComplete="address-level2"
              enterKeyHint="next"
              defaultValue={state.values?.cidade}
              disabled={isPending}
              aria-invalid={errors.cidade ? true : undefined}
              aria-describedby={describedBy('cidade')}
              onBlur={(event) => checkField('cidade', event.target.value)}
            />
            {errors.cidade ? (
              <p className={styles.error} id="cidade-erro">
                {errors.cidade}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className="visually-hidden" htmlFor="bairro">
              Bairro
            </label>
            <input
              id="bairro"
              name="bairro"
              className={styles.input}
              type="text"
              placeholder="Bairro"
              autoComplete="address-level3"
              enterKeyHint="done"
              defaultValue={state.values?.bairro}
              disabled={isPending}
              aria-invalid={errors.bairro ? true : undefined}
              aria-describedby={describedBy('bairro')}
              onBlur={(event) => checkField('bairro', event.target.value)}
            />
            {errors.bairro ? (
              <p className={styles.error} id="bairro-erro">
                {errors.bairro}
              </p>
            ) : null}
          </div>
        </div>

        <fieldset className={styles.help}>
          <legend className={styles.helpLegend}>Como você quer ajudar?</legend>
          {HELP_OPTIONS.map((option) => (
            <label className={styles.option} key={option.value}>
              <input
                type="checkbox"
                name="ajuda"
                value={option.value}
                disabled={isPending}
                onChange={(event) => {
                  const form = event.currentTarget.form;
                  if (!form) return;
                  const selected = new FormData(form)
                    .getAll('ajuda')
                    .filter((v): v is string => typeof v === 'string');
                  checkField('ajuda', selected);
                }}
              />
              {option.label}
            </label>
          ))}
          {errors.ajuda ? (
            <p className={styles.error} id="ajuda-erro">
              {errors.ajuda}
            </p>
          ) : null}
        </fieldset>

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
    </>
  );
}
