import '../styles/global.css';
import '../styles/xignal-ui.css';
import { getSettings } from '../lib/xdata.js';
import { resolveFonts } from '../lib/xfonts.js';

// URL is set by Netlify at build/runtime; falls back to the planned production domain.
const SITE_URL = process.env.URL || 'https://mysignal.id';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MySignal — Signals from the Digital World',
    template: '%s | MySignal'
  },
  description: 'MySignal is a technology media platform covering cybersecurity, cloud, network infrastructure, fiber optic, AI, and big tech.',
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0B0F'
};

export default async function RootLayout({ children }) {
  let fonts;
  try { fonts = resolveFonts(await getSettings()); } catch { fonts = resolveFonts({}); }
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fonts.href} rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `:root{--f-head:${fonts.head};--f-body:${fonts.body};}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
