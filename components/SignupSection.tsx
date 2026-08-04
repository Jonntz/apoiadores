import { SupporterForm } from './SupporterForm';
import styles from './SignupSection.module.css';

export function SignupSection() {
  return (
    <section className={styles.section} id="cadastro" aria-labelledby="cadastro-titulo">
      <div className={`shell ${styles.inner}`}>
        <div className={styles.copy}>
          <p className="eyebrow">Faça parte do time oficial</p>
          <h2 className={styles.title} id="cadastro-titulo">
            Cadastre-se para ser um Líder e Multiplicador da nossa Campanha!
          </h2>
          <p className={styles.lead}>
            Preencha seus dados para entrar no nosso grupo VIP de WhatsApp, receber
            materiais exclusivos de rua e digitais, e organizar a militância na sua
            cidade/bairro.
          </p>
        </div>

        <SupporterForm />
      </div>
    </section>
  );
}
