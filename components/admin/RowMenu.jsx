'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon.jsx';

// Three-dot action menu for list rows. Big tap targets, closes on outside tap / Escape.
export default function RowMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="rowmenu" ref={ref}>
      <button type="button" className="icon-btn plain" aria-label="Aksi" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="more" />
      </button>
      {open && (
        <div className="rowmenu-pop" role="menu">
          {items.map((it) => (
            <button
              key={it.label} type="button" role="menuitem" className={it.danger ? 'danger' : ''}
              onClick={() => { setOpen(false); it.onClick(); }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
