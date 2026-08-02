import { CANDIDATE, LINKS } from '@/lib/site';
import { Arrow } from './Arrow';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.inner}`}>
        <div className={styles.top}>
          <p className={styles.role}>
            Candidato a {CANDIDATE.role} &bull; {CANDIDATE.state}
          </p>
          <blockquote className={styles.quote}>
            &ldquo;Por uma Minas mais livre, próspera e segura para a nossa juventude e
            para a família.&rdquo;
          </blockquote>
          <a className="btn btn--lg" href="#cadastro">
            Junte-se à militância digital do Matheusinho
            {Arrow}
          </a>
          <nav className={styles.social} aria-label="Redes e doação">
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href={LINKS.donate} target="_blank" rel="noopener noreferrer">
              Doe agora
            </a>
          </nav>
        </div>

        <div className={styles.legal}>
          <p>
            {CANDIDATE.name} — {CANDIDATE.role} &bull; {CANDIDATE.state} &middot; Partido{' '}
            {CANDIDATE.party}
          </p>
          <p>Política de privacidade &middot; Prestação de contas</p>
        </div>
      </div>
    </footer>
  );
}
