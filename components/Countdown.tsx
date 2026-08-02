import { CANDIDATE, ELECTION_DATE, ELECTION_LABEL, daysUntilElection } from '@/lib/site';
import styles from './Countdown.module.css';

/**
 * Rendered on the server so the number is in the HTML for crawlers and paints
 * with no layout shift. The page revalidates hourly (see app/page.tsx), which
 * is well inside the once-a-day cadence this actually changes at.
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
          <div className={`${styles.card} ${styles.days}`}>
            <dt>Faltam</dt>
            <dd>
              <span className={styles.daysValue}>{days}</span>
              <span className={styles.daysUnit}>{days === 1 ? 'dia' : 'dias'}</span>
            </dd>
          </div>

          <div className={styles.card}>
            <dt>Data</dt>
            <dd>
              <time dateTime={ELECTION_DATE}>{ELECTION_LABEL}</time>
            </dd>
          </div>

          <div className={styles.card}>
            <dt>Local da missão</dt>
            <dd>
              Minas Gerais
              <br />
              &amp; Brasília
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
