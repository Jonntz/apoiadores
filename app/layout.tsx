import type { Metadata, Viewport } from 'next';
import ReactDOM from 'react-dom';
import { CANDIDATE, SITE_URL } from '@/lib/site';
import './globals.css';

const TITLE = `${CANDIDATE.name} — ${CANDIDATE.role} • ${CANDIDATE.state}`;
const DESCRIPTION =
  'Cadastre-se para ser líder e multiplicador da campanha de Matheus Biancardine a Deputado Federal por Minas Gerais pelo NOVO. Entre no grupo VIP de WhatsApp da militância da sua região.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s — ${CANDIDATE.name}`,
  },
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
  themeColor: '#012E40',
  colorScheme: 'dark',
};

/**
 * Above-the-fold weights only: the wordmark, the H1/CTA black, and body
 * regular. 500 and 700 appear further down the page and swap in on their own.
 *
 * ReactDOM.preload rather than <link> tags in <head>: React owns the resource
 * and emits it exactly once. Hand-written <head> links get hoisted *and* kept,
 * which duplicates every preload in the HTML.
 */
const PRELOADED_FONTS = [
  '/fonts/neo-sans-900.woff2',
  '/fonts/neo-sans-400.woff2',
  '/fonts/neo-sans-900-italic.woff2',
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  for (const href of PRELOADED_FONTS) {
    ReactDOM.preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  }

  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#cadastro">
          Ir para o cadastro
        </a>
        {children}
      </body>
    </html>
  );
}
