import { Countdown } from '@/components/Countdown';
import { DonationBar } from '@/components/DonationBar';
import { FloatingCta } from '@/components/FloatingCta';
import { Hero } from '@/components/Hero';
import { Manifesto } from '@/components/Manifesto';
import { SignupSection } from '@/components/SignupSection';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { SocialProof } from '@/components/SocialProof';
import { CANDIDATE, LINKS, SITE_URL } from '@/lib/site';

/**
 * Statically rendered and revalidated hourly. The only time-dependent value on
 * the page is the days-to-election counter, which changes once a day — so the
 * page is served from the CDN essentially all the time.
 */
export const revalidate = 3600;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#candidato`,
      name: CANDIDATE.name,
      jobTitle: `Candidato a ${CANDIDATE.role} por ${CANDIDATE.state}`,
      affiliation: { '@type': 'PoliticalParty', name: `Partido ${CANDIDATE.party}` },
      url: SITE_URL,
      image: `${SITE_URL}/og.jpg`,
      sameAs: [LINKS.instagram],
      address: {
        '@type': 'PostalAddress',
        addressRegion: CANDIDATE.state,
        addressCountry: 'BR',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#site`,
      url: SITE_URL,
      name: `${CANDIDATE.name} — ${CANDIDATE.role} • ${CANDIDATE.state}`,
      inLanguage: 'pt-BR',
      about: { '@id': `${SITE_URL}/#candidato` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // Content is a literal defined above — no user input reaches it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <DonationBar />
      <main id="conteudo">
        <Hero />
        <Countdown />
        <SocialProof />
        <SignupSection />
        <Manifesto />
      </main>
      <SiteFooter />
      <FloatingCta />
    </>
  );
}
