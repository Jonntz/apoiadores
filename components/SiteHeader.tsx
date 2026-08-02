import { Arrow } from './Arrow';
import { Wordmark } from './Wordmark';
import styles from './SiteHeader.module.css';

const NAV = [
  { href: '#missao', label: 'A missão' },
  { href: '#cadastro', label: 'Cadastro' },
  { href: '#quem-e', label: 'Quem é Matheus' },
] as const;

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`shell ${styles.inner}`}>
        <a href="#topo" aria-label="Matheus Biancardine — início">
          <Wordmark size="clamp(1.1875rem, 0.7rem + 2vw, 1.875rem)" />
        </a>

        <nav className={styles.nav} aria-label="Seções da página">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className={`btn ${styles.cta}`} href="#cadastro">
          Seja um apoiador
          {Arrow}
        </a>

        {/* <details> gives an accessible disclosure with zero client JS. */}
        <details className={styles.menu} name="menu-mobile">
          <summary aria-label="Abrir menu">
            <span />
            <span />
            <span />
          </summary>
          <div className={styles.panel}>
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
            <a className={`btn ${styles.panelCta}`} href="#cadastro">
              Seja um apoiador
              {Arrow}
            </a>
          </div>
        </details>
      </div>
    </header>
  );
}
