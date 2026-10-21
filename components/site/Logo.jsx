import Link from 'next/link';

// Logo Xi:gnal (file: /public/xignal-logo.png, background transparan).
export default function Logo({ size = 'md' }) {
  const h = size === 'lg' ? 58 : 42;
  return (
    <Link href="/" className={`x-logo x-logo-${size}`} aria-label="Xi:gnal, beranda">
      <img src="/xignal-logo.png" alt="Xi:gnal" height={h} width={Math.round(h * 720 / 276)} />
    </Link>
  );
}
