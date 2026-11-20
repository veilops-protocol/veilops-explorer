import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { SoundProvider } from '@/components/sound';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'VEILOPS: proof without exposure', template: '%s · VEILOPS' },
  description: 'Privacy infrastructure for programmable financial operations, cryptographic proofs and selective disclosure. Keep the information private. Make the outcome verifiable.',
  openGraph: { title: 'VEILOPS', description: SITE.tagline, url: SITE.url, siteName: 'VEILOPS', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'VEILOPS', description: SITE.tagline },
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = { themeColor: '#080909', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Hide the intro before first paint for returning visitors and reduced-motion users (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('veilops.intro.v1')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.introSeen='1'}catch(e){}" }} />
      </head>
      <body className="grain font-sans">
        <SoundProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </SoundProvider>
      </body>
    </html>
  );
}
