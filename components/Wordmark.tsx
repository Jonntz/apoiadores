import { CANDIDATE } from '@/lib/site';
import styles from './Wordmark.module.css';

type Props = {
  /** Wordmark cap height; the role line scales from it. */
  size?: string;
  /** Drop the "DEPUTADO FEDERAL • MG" line (tight spots like the mobile bar). */
  showRole?: boolean;
};

export function Wordmark({ size, showRole = true }: Props) {
  return (
    <span
      className={styles.wordmark}
      style={size ? ({ '--size': size } as React.CSSProperties) : undefined}
    >
      <span className={styles.name}>
        MATHEUS <em>BIANCARDINE</em>
      </span>
      {showRole ? (
        <span className={styles.role}>
          {CANDIDATE.role} &middot; {CANDIDATE.state}
        </span>
      ) : null}
    </span>
  );
}
