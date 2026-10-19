import Link from 'next/link';
import SIcon from './SIcon.jsx';

export default function SectionHead({ title, desc, href, cta, as = 'h2', align = 'left' }) {
  const H = as;
  return (
    <div className={`x-sh x-sh-${align}`}>
      <div className="x-sh-main">
        <H className="x-h2">{title}</H>
        <span className="x-bar" />
        {desc && <p className="x-sh-desc">{desc}</p>}
      </div>
      {href && (
        <Link href={href} className="x-circle" aria-label={cta || 'Lihat semua'}>
          <SIcon name="chevronR" size={18} />
        </Link>
      )}
    </div>
  );
}
