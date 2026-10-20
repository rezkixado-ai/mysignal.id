// Pilihan font yang bisa diganti dari Admin → Pengaturan → Tampilan & Font.
// `gf` = potongan URL Google Fonts. Tambah opsi baru cukup menambah satu baris di sini.
export const HEADLINE_FONTS = {
  'red-hat': { label: 'Red Hat Display', family: "'Red Hat Display'", gf: 'Red+Hat+Display:wght@500;600;700;800;900', note: 'Tegas & modern (bawaan)' },
  'space-grotesk': { label: 'Space Grotesk', family: "'Space Grotesk'", gf: 'Space+Grotesk:wght@500;600;700', note: 'Teknis, karakter kuat' },
  sora: { label: 'Sora', family: "'Sora'", gf: 'Sora:wght@500;600;700;800', note: 'Lebar & futuristik' }
};
export const BODY_FONTS = {
  inter: { label: 'Inter', family: "'Inter'", gf: 'Inter:wght@400;500;600;700', note: 'Netral & paling jelas (bawaan)' },
  'plus-jakarta': { label: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans'", gf: 'Plus+Jakarta+Sans:wght@400;500;600;700', note: 'Hangat & modern' },
  literata: { label: 'Literata', family: "'Literata'", gf: 'Literata:wght@400;500;600;700', note: 'Serif, nyaman baca panjang' }
};
export const DEFAULT_HEADLINE = 'red-hat';
export const DEFAULT_BODY = 'inter';

const FALLBACK_SANS = "system-ui,-apple-system,'Segoe UI',sans-serif";
const FALLBACK_SERIF = "Georgia,'Times New Roman',serif";

export function resolveFonts(settings = {}) {
  const h = HEADLINE_FONTS[settings.font_heading] || HEADLINE_FONTS[DEFAULT_HEADLINE];
  const b = BODY_FONTS[settings.font_body] || BODY_FONTS[DEFAULT_BODY];
  const bodyFallback = b.label === 'Literata' ? FALLBACK_SERIF : FALLBACK_SANS;
  return {
    head: `${h.family},${FALLBACK_SANS}`,
    body: `${b.family},${bodyFallback}`,
    href: `https://fonts.googleapis.com/css2?family=${h.gf}&family=${b.gf}&display=swap`
  };
}
export const previewHref = () =>
  `https://fonts.googleapis.com/css2?${[...Object.values(HEADLINE_FONTS), ...Object.values(BODY_FONTS)].map((f) => `family=${f.gf}`).join('&')}&display=swap`;
