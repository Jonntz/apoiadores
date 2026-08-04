import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import { CANDIDATE, SITE_URL } from '@/lib/site';
import './globals.css';

/**
 * Same pairing as the approved reference build. next/font downloads and
 * self-hosts these at build time, so unlike the reference there is no
 * fonts.googleapis.com round-trip on the critical path.
 */
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

// 700 only: every display element (headings, buttons, eyebrows, labels) is
// bold, so shipping the 600 cut would be ~15 KB nobody renders.
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-display',
  display: 'swap',
});

const TITLE = `${CANDIDATE.name} — ${CANDIDATE.role} • ${CANDIDATE.state}`;
const DESCRIPTION =
  'Cadastre-se para ser líder e multiplicador da campanha de Matheus Biancardine a Deputado Federal por Minas Gerais pelo NOVO. Entre no grupo VIP de WhatsApp da militância da sua região.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s — ${CANDIDATE.name}` },
  description: DESCRIPTION,
  applicationName: CANDIDATE.name,
  authors: [{ name: CANDIDATE.name }],
  keywords: [
    'Matheus Biancardine',
    'Deputado Federal MG',
    'Partido NOVO',
    'Minas Gerais',
    'militância digital',
    'apoiadores',
    'eleições 2026',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: CANDIDATE.name,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: `${CANDIDATE.name}, candidato a ${CANDIDATE.role} por ${CANDIDATE.state}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#001E37',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <a className="skip-link" href="#cadastro">
          Ir para o cadastro
        </a>
        {children}
      </body>
    </html>
  );
}
