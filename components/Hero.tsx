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

        {/* preload="none": the file is 22 MB, so nothing but the poster is
            fetched until someone presses play. The poster carries the width and
            height attributes' ratio, so the slot is reserved and the button
            below it never jumps. */}
        <video
          className={styles.video}
          src="/video/simoes.mp4"
          poster="/video/simoes-poster.webp"
          controls
          preload="none"
          playsInline
          width={720}
          height={1280}
        >
          Seu navegador não reproduz este vídeo.{' '}
          <a href="/video/simoes.mp4">Baixe o depoimento</a>.
        </video>

        <a className="btn" href="#cadastro" style={{ marginBottom: '2rem'}}>
          Quero ser um apoiador
          {Arrow}
        </a>
      </div>
    </section>
  );
}
