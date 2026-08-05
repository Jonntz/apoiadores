import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import Script from 'next/script';
import { GA_MEASUREMENT_ID, META_PIXEL_ID } from '@/lib/analytics';
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

        {/* Google tag (gtag.js) — GA4.
            afterInteractive, not beforeInteractive: analytics must never sit on
            the critical path. It loads once the page is usable, so it costs
            nothing in LCP or in time to first interaction. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>

        {/* Meta Pixel. The snippet injects connect.facebook.net itself, so there
            is no second <Script src>; afterInteractive keeps it off the critical
            path just like the Google tag. */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
