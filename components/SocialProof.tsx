import Image from 'next/image';
import bhPredio from '@/assets/bh-predio.jpg';
import evento1 from '@/assets/evento1.jpg';
import evento2 from '@/assets/evento2.jpg';
import falaMicrofone from '@/assets/fala-microfone.jpg';
import grupo from '@/assets/grupo.jpg';
import styles from './SocialProof.module.css';

const STATS = [
  { value: '19', label: ['estados', 'percorridos'] },
  { value: '10', label: ['anos de', 'militância'] },
] as const;

/** Everything below the hero loads lazily — this section is off-screen at paint. */
const TILE_SIZES = '(min-width: 64rem) 33vw, 50vw';

export function SocialProof() {
  return (
    <section className={styles.section} aria-labelledby="forca-titulo">
      <div className={`shell ${styles.inner}`}>
        <div className={styles.head}>
          <div className={styles.intro}>
            <p className="eyebrow">&bull; A força que já está na rua &bull;</p>
            <h2 className={styles.title} id="forca-titulo">
              O movimento que começou em BH agora vai <em>tomar Minas Gerais.</em>
            </h2>
          </div>

          <dl className={styles.stats}>
            {STATS.map((stat) => (
              <div className={styles.stat} key={stat.value}>
                <dt className={styles.statValue}>{stat.value}</dt>
                <dd className={styles.statLabel}>
                  {stat.label[0]}
                  <br />
                  {stat.label[1]}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.grid}>
          <figure className={`${styles.tile} ${styles.lead}`}>
            <Image
              src={grupo}
              alt="Lideranças da Juventude NOVO de todo o país reunidas em Brasília"
              fill
              sizes="(min-width: 64rem) 45vw, 100vw"
              placeholder="blur"
            />
            <figcaption className={styles.tileCaption}>
              Lideranças de todo o país reunidas em Brasília
            </figcaption>
          </figure>

          <div className={`${styles.tile} ${styles.small}`}>
            <Image
              src={falaMicrofone}
              alt="Matheus Biancardine falando ao microfone em um encontro de formação"
              fill
              sizes={TILE_SIZES}
              style={{ objectPosition: '50% 22%' }}
              placeholder="blur"
            />
          </div>

          <div className={`${styles.tile} ${styles.small}`}>
            <Image
              src={evento1}
              alt="Matheus Biancardine durante uma formação de lideranças"
              fill
              sizes={TILE_SIZES}
              placeholder="blur"
            />
          </div>

          <div className={`${styles.tile} ${styles.small} ${styles.deskOnly}`}>
            <Image
              src={evento2}
              alt="Debate de propostas entre jovens lideranças"
              fill
              sizes={TILE_SIZES}
              placeholder="blur"
            />
          </div>

          <div className={`${styles.tile} ${styles.small} ${styles.deskOnly}`}>
            <Image
              src={bhPredio}
              alt="Matheus Biancardine em frente ao Edifício Niemeyer, no centro de Belo Horizonte"
              fill
              sizes={TILE_SIZES}
              placeholder="blur"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
