import { LINKS } from '@/lib/site';
import { Arrow } from './Arrow';
import styles from './DonationBar.module.css';

export function DonationBar() {
  return (
    <aside className={styles.bar} aria-label="Doação para a campanha">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={`shell ${styles.inner}`}>
        <div className={styles.copy}>
          <p className="eyebrow">&bull; Seja um apoiador &bull;</p>
          <p className={styles.lead}>
            <em>A nossa campanha é feita por pessoas de bem,</em> sem usar fundão bilionário.
          </p>
          <p className={styles.sub}>Considere fazer uma doação e ajudar a liberdade!</p>
        </div>
        <a
          className="btn btn--lg"
          href={LINKS.donate}
          target="_blank"
          rel="noopener noreferrer"
        >
          Quero doar
          {Arrow}
        </a>
      </div>
    </aside>
  );
}
