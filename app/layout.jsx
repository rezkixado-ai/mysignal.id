import '../styles/global.css';

export const metadata = {
  metadataBase: new URL('https://mysignal.id'), // update once the real domain is live
  title: {
    default: 'MySignal — Signals from the Digital World',
    template: '%s | MySignal'
  },
  description: 'MySignal is a technology media platform covering cybersecurity, cloud, network infrastructure, fiber optic, AI, and big tech.',
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
