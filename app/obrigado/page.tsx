import type { Metadata } from 'next';
import { Arrow } from '@/components/Arrow';
import { Wordmark } from '@/components/Wordmark';
import { CANDIDATE, LINKS, SITE_URL } from '@/lib/site';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Cadastro confirmado',
  description:
    'Seu cadastro na militância de Matheus Biancardine foi confirmado. Entre no grupo de WhatsApp da sua região.',
  alternates: { canonical: '/obrigado' },
  // Conversion page: useful to people who just converted, noise in search.
  robots: { index: false, follow: true },
};

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

export default function ThankYou() {
  return (
    <div className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />

      <header className={`shell ${styles.bar}`}>
        <a href="/" aria-label="Matheus Biancardine — início">
          <Wordmark size="1.5rem" showRole={false} />
        </a>
        <p className={styles.barRole}>
          {CANDIDATE.role} &bull; {CANDIDATE.state}
        </p>
      </header>

      <main className={`shell ${styles.main}`}>
        <p className={styles.seal}>{Check}</p>
        <p className="eyebrow">Cadastro confirmado</p>
        <h1 className={styles.title}>
          Bem-vindo ao time, <em>multiplicador!</em>
        </h1>
        <p className={styles.lead}>
          Falta só um passo: entre agora no grupo de WhatsApp da militância da sua região
          para receber os materiais e as primeiras missões da semana.
        </p>

        <a
          className="btn btn--lg"
          href={LINKS.whatsappGroup}
          target="_blank"
          rel="noopener noreferrer"
        >
          Entrar no grupo de WhatsApp
          {Arrow}
        </a>
        <p className={styles.hint}>O link também foi enviado para o seu WhatsApp cadastrado.</p>

        <ol className={styles.steps}>
          <li className={styles.step}>
            <h2 className={styles.stepTitle}>1. Siga nas redes</h2>
            <p className={styles.stepText}>
              Acompanhe a agenda e compartilhe os cortes do dia.
            </p>
            <a
              className={styles.stepLink}
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              @matheus.biancardine &rarr;
            </a>
          </li>

          <li className={styles.step}>
            <h2 className={styles.stepTitle}>2. Chame 3 amigos</h2>
            <p className={styles.stepText}>
              Militância se multiplica: convide quem também não aceita o silêncio.
            </p>
            <a
              className={styles.stepLink}
              href={`https://wa.me/?text=${encodeURIComponent(
                `Entrei para a militância do ${CANDIDATE.name}, candidato a ${CANDIDATE.role} por ${CANDIDATE.state}. Cadastre-se você também: ${SITE_URL}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Compartilhar link &rarr;
            </a>
          </li>

          <li className={`${styles.step} ${styles.stepHighlight}`}>
            <h2 className={styles.stepTitle}>3. Ajude a campanha</h2>
            <p className={styles.stepText}>
              Sem fundão bilionário: nossa força vem de pessoas de bem.
            </p>
            <a
              className={styles.stepLink}
              href={LINKS.donate}
              target="_blank"
              rel="noopener noreferrer"
            >
              Quero doar &rarr;
            </a>
          </li>
        </ol>
      </main>
    </div>
  );
}
