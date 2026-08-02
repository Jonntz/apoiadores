import { SupporterForm } from './SupporterForm';
import styles from './SignupSection.module.css';

const PERKS = [
  'Grupo regional de WhatsApp por cidade',
  'Kit digital para postar nas suas redes',
  'Material de rua, adesivo e bandeira',
] as const;

const Check = (
  <svg
    className={styles.check}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m4 10.5 4 4 8-9" />
  </svg>
);

export function SignupSection() {
  return (
    <section className={styles.section} id="cadastro" aria-labelledby="cadastro-titulo">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={`shell ${styles.inner}`}>
        <div className={styles.copy}>
          <p className="eyebrow">&bull; Faça parte do time oficial</p>
          <h2 className={styles.title} id="cadastro-titulo">
            Cadastre-se para ser um <em>Líder e Multiplicador</em> da nossa Campanha!
          </h2>
          <p className={styles.lead}>
            Preencha seus dados para entrar no nosso grupo VIP de WhatsApp, receber
            materiais exclusivos de rua e digitais, e organizar a militância na sua
            cidade/bairro.
          </p>
          <ul className={styles.perks}>
            {PERKS.map((perk) => (
              <li className={styles.perk} key={perk}>
                {Check}
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <SupporterForm />
      </div>
    </section>
  );
}
