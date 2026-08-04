import { CANDIDATE, ELECTION_DATE, ELECTION_LABEL, daysUntilElection } from '@/lib/site';
import styles from './Countdown.module.css';

const CalendarIcon = (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

const HourglassIcon = (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 3h12M6 21h12M8 3v4l4 4 4-4V3M8 21v-4l4-4 4 4v4" />
  </svg>
);

const PinIcon = (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

/**
 * Rendered on the server so the number is in the HTML for crawlers and paints
 * with no layout shift. The page revalidates hourly (see app/page.tsx), well
 * inside the once-a-day cadence this actually changes at.
 */
export function Countdown() {
  const days = daysUntilElection();

  return (
    <section className={styles.section} id="missao" aria-labelledby="missao-titulo">
      <div className={`shell ${styles.inner}`}>
        <p className={styles.kicker}>
          Candidatura Oficial a {CANDIDATE.role} &bull; {CANDIDATE.state}
        </p>
        <p className={styles.pill}>{CANDIDATE.name} — Jovem a Serviço de Minas</p>
        <h2 className={styles.title} id="missao-titulo">
          Faltam poucos dias para mudarmos a história do Congresso Nacional!
        </h2>

        <dl className={styles.cards}>
          <div className={styles.card}>
            {CalendarIcon}
            <dt className={styles.label}>Data</dt>
            <dd className={styles.value}>
              <time dateTime={ELECTION_DATE}>{ELECTION_LABEL}</time>
            </dd>
          </div>

          {/* Same three children as the cards beside it — icon, label, value —
              so the rows line up across all of them. The unit lives inside the
              value instead of being a fourth child. */}
          <div className={`${styles.card} ${styles.days}`}>
            {HourglassIcon}
            <dt className={styles.label}>Faltam</dt>
            <dd className={styles.value}>
              <span className={styles.daysValue}>{days}</span>
              {/* Whitespace node: grid ignores it for layout, but it keeps the
                  accessible text "61 dias" instead of "61dias". */}{' '}
              <span className={styles.label}>{days === 1 ? 'dia' : 'dias'}</span>
            </dd>
          </div>

          <div className={styles.card}>
            {PinIcon}
            <dt className={styles.label}>Local</dt>
            <dd className={styles.value}>Minas Gerais &amp; Brasília</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
