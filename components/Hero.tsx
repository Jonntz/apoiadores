import { Arrow } from './Arrow';
import { ArtBackdrop } from './ArtBackdrop';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-titulo">
      <ArtBackdrop
        name="hero"
        alt="Matheus Biancardine discursando ao microfone diante de apoiadores"
      />
      <div className={styles.scrim} />

      <div className={`shell ${styles.inner}`}>
        <div className={styles.copy}>
          <h1 className={styles.title} id="hero-titulo">
            O primeiro passo foi dado. <em>Agora, a nossa missão precisa da sua voz!</em>
          </h1>
        </div>

        <div className={styles.copy}>
          <p className={styles.lead}>
            Fui aprovado oficialmente como candidato a Deputado Federal por Minas Gerais
            pelo NOVO!
          </p>
          <p className={styles.lead}>
            Agora convoco você para fazer parte da maior rede de militância e liderança
            jovem do nosso estado.
          </p>
        </div>

        <p className={styles.punch}>
          Não vamos entregar o Brasil à podridão ideológica da esquerda!
        </p>

        <a className="btn" href="#cadastro">
          Quero ser um apoiador
          {Arrow}
        </a>
      </div>
    </section>
  );
}
