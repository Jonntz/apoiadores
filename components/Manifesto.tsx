import Image from 'next/image';
import retrato from '@/assets/retrato-novo.jpg';
import styles from './Manifesto.module.css';

export function Manifesto() {
  return (
    <section className={styles.section} id="quem-e" aria-labelledby="quem-e-titulo">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.scrim} />

      <div className={`shell ${styles.inner}`}>
        <div className={styles.head}>
          <p className="eyebrow">&bull; Quem é Matheus &bull;</p>
          <h2 className={styles.title} id="quem-e-titulo">
            Minas precisa da <em>coragem da juventude.</em>
          </h2>
        </div>

        <div className={styles.portrait}>
          <Image
            src={retrato}
            alt="Retrato de Matheus Biancardine com a camisa do Partido NOVO"
            fill
            sizes="(min-width: 64rem) 380px, 100vw"
            placeholder="blur"
          />
        </div>

        <div className={styles.body}>
          <p>
            Quem me conhece sabe que a nossa trajetória não nasceu em gabinetes apertados!
            Fugi da violência do Rio de Janeiro após um assalto brutal contra meu pai, e
            minha família encontrou em Minas o porto seguro de fé, trabalho e{' '}
            <strong>liberdade</strong>.
          </p>
          <p>
            Aos 14 anos, transformei a dor da insegurança em vocação ao frequentar a Câmara
            Municipal sob a mentoria do nosso Governador Mateus Simões. Aos 15, enfrentei a
            burocracia e a oposição para fundar a <strong>Juventude</strong> do Partido
            NOVO! Como Diretor de Juventude do Estado e Presidente Nacional da Juventude,
            rodei mais de 19 estados provando que a juventude quer trabalhar, produzir e
            ter dignidade.
          </p>
          <p>
            Hoje, perante a volta de Lula, do PT e de ideologias que atacam a família, a
            propriedade e a liberdade, coloco meu nome à disposição para ser a sua voz em
            Brasília. Mas não vou sozinho!{' '}
            <b>Esta campanha pertence a cada mineiro que recusa o silêncio cúmplice.</b>
          </p>
        </div>
      </div>
    </section>
  );
}
