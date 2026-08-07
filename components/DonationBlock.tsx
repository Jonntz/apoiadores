import { LINKS } from '@/lib/site';
import { Arrow } from './Arrow';
import { ArtBackdrop } from './ArtBackdrop';
import styles from './DonationBlock.module.css';

/**
 * Blocks 0 and 1: the "seja um apoiador" rule and the donation board.
 *
 * The reference build bakes this headline into the artwork as pixels. Here it
 * is real text over the clean board, so it is searchable, selectable, scales
 * with the user's font size, and stays sharp on any display.
 */
export function DonationBlock() {
  return (
    <>
      {/* The whole rule is the hit area — it is the first thing on the page and
          it now sends you straight to the form. The bullets are decoration, so
          the link is announced as just "Seja um apoiador". */}
      <a className={styles.topbar} href="#cadastro">
        <span className={styles.topbarText}>
          <span aria-hidden="true">&bull;</span> Seja um apoiador{' '}
          <span aria-hidden="true">&bull;</span>
        </span>
      </a>

      <section className={styles.section} id="topo" aria-labelledby="doacao-titulo">
        <ArtBackdrop
          name="doacao"
          alt="Matheus Biancardine ao lado de apoiadores e lideranças da campanha"
          priority
        />
        <div className={styles.scrim} />

        <div className={`shell ${styles.inner}`}>
          <h2 className={styles.headline} id="doacao-titulo">
            <em>A nossa campanha é feita por pessoas de bem,</em> sem usar fundão bilionário.
          </h2>
          <p className={styles.sub}>Considere fazer uma doação e ajudar a liberdade!</p>
          <a
            className="btn btn--lg"
            href="#cadastro"
            rel="noopener noreferrer"
          >
            Quero Entrar no Time!
            {Arrow}
          </a>
        </div>
      </section>
    </>
  );
}
