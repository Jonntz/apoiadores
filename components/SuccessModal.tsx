'use client';

import { useEffect, useRef } from 'react';
import { trackSignupConversion } from '@/lib/analytics';
import { CANDIDATE, LINKS, SITE_URL } from '@/lib/site';
import { Arrow } from './Arrow';
import styles from './SuccessModal.module.css';

/** Every interactive element the panel can hold, in DOM order. */
const FOCUSABLE = 'a[href], button:not([disabled])';

const SHARE_URL = `https://wa.me/?text=${encodeURIComponent(
  `Entrei para a militância do ${CANDIDATE.name}, candidato a ${CANDIDATE.role} por ${CANDIDATE.state}. Cadastre-se você também: ${SITE_URL}`,
)}`;

const Check = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m5 12.5 5 5 9-11" />
  </svg>
);

const Close = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

/**
 * `returning` is a supporter whose WhatsApp was already on the sheet: nothing
 * was written, so the panel confirms rather than thanks — and no conversion is
 * reported, since there is no new lead.
 */
export function SuccessModal({
  onClose,
  returning = false,
}: {
  onClose: () => void;
  returning?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reported = useRef(false);

  useEffect(() => {
    // Exactly once per confirmed registration. The ref survives StrictMode's
    // double-invoked effects, which would otherwise count every lead twice in
    // development and make the numbers impossible to trust while testing.
    if (returning || reported.current) return;
    reported.current = true;
    trackSignupConversion();
  }, [returning]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const previouslyFocused = document.activeElement;
    panel.focus();

    // Escape closes, Tab cycles inside the panel. Hand-rolled rather than a
    // native <dialog>: that one is invisible until showModal() runs, so a
    // no-JS submit would swallow the confirmation entirely. A plain overlay
    // renders from the server markup either way.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const targets = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = bodyOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  return (
    // mousedown, not click: a text selection that starts inside the panel and
    // ends on the backdrop should not count as a dismissal.
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cadastro-sucesso-titulo"
        tabIndex={-1}
      >
        <div className={styles.texture} aria-hidden="true" />

        <button className={styles.close} type="button" onClick={onClose} aria-label="Fechar">
          {Close}
        </button>

        <p className={styles.seal}>{Check}</p>
        <p className="eyebrow">{returning ? 'Você já está na lista' : 'Cadastro confirmado'}</p>
        <h2 className={styles.title} id="cadastro-sucesso-titulo">
          {returning ? 'Você já é do time, ' : 'Bem-vindo ao time, '}
          <em>multiplicador!</em>
        </h2>
        <p className={styles.lead}>
          {returning
            ? 'Esse WhatsApp já está cadastrado, não precisa se inscrever de novo. Se ainda não entrou no grupo da militância da sua região, o link está logo abaixo.'
            : 'Falta só um passo: entre agora no grupo de WhatsApp da militância da sua região para receber os materiais e as primeiras missões da semana.'}
        </p>

        <div className={styles.actions}>
          <a
            className="btn btn--block"
            href={LINKS.whatsappGroup}
            target="_blank"
            rel="noopener noreferrer"
          >
            Entrar no grupo de WhatsApp
            {Arrow}
          </a>
          <a
            className="btn btn--block btn--ghost"
            href={LINKS.donate}
            target="_blank"
            rel="noopener noreferrer"
          >
            Quero doar para a campanha
            {Arrow}
          </a>
        </div>

        {/* Only true when a row was just written — nothing is sent to someone
            who was already on the list. */}
        {returning ? null : (
          <p className={styles.hint}>
            O link do grupo também foi enviado para o seu WhatsApp cadastrado.
          </p>
        )}

        <ul className={styles.extras}>
          <li>
            <a
              className={styles.extraLink}
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Siga @matheus.biancardine &rarr;
            </a>
          </li>
          <li>
            <a
              className={styles.extraLink}
              href={SHARE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chamar 3 amigos &rarr;
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
