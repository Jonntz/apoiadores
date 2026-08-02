import Image from 'next/image';
import heroPalco from '@/assets/hero-palco.jpg';
import { Arrow } from './Arrow';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} id="topo">
      <div className={`shell ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.badge}>
            <span className={styles.dot} />
            <span>Candidatura oficial aprovada — Partido NOVO</span>
          </p>

          <h1 className={styles.title}>
            O primeiro passo foi dado.{' '}
            <em>Agora, a nossa missão precisa da sua voz!</em>
          </h1>

          <p className={styles.lead}>
            Fui aprovado oficialmente como candidato a Deputado Federal por Minas Gerais
            pelo NOVO! Agora convoco você para fazer parte da maior rede de militância e
            liderança jovem do nosso estado.
          </p>

          <p className={styles.punch}>
            Não vamos entregar o Brasil à podridão ideológica da esquerda!
          </p>

          <div className={styles.actions}>
            <a className="btn btn--lg" href="#cadastro">
              Quero ser um apoiador
              {Arrow}
            </a>
            <p className={styles.reassure}>
              Leva 40 segundos.
              <br />
              Entrada direta no grupo VIP de WhatsApp.
            </p>
          </div>
        </div>

        <figure className={styles.figure}>
          <Image
            className={styles.photo}
            src={heroPalco}
            alt="Matheus Biancardine discursando no Encontro Nacional da Juventude NOVO"
            fill
            sizes="(min-width: 64rem) 620px, 100vw"
            priority
            fetchPriority="high"
            placeholder="blur"
          />
          <div className={styles.scrim} />
          <figcaption className={styles.caption}>
            <span className={styles.captionTitle}>
              A juventude que trabalha, produz e não recua.
            </span>
            <span className={styles.captionMeta}>Encontro Nacional da Juventude NOVO</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
