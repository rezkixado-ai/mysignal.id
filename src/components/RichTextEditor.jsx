import { useEffect, useRef } from 'react';

const BTNS = [
  { cmd: 'bold', label: 'B', style: { fontWeight: 700 } },
  { cmd: 'italic', label: 'I', style: { fontStyle: 'italic' } },
  { cmd: 'formatBlock:h2', label: 'H2' },
  { cmd: 'formatBlock:h3', label: 'H3' },
  { cmd: 'formatBlock:p', label: 'P' },
  { cmd: 'insertUnorderedList', label: '• List' },
  { cmd: 'insertOrderedList', label: '1. List' },
  { cmd: 'createLink', label: 'Link' },
  { cmd: 'removeFormat', label: 'Clear' }
];

export default function RichTextEditor({ value, onChange }) {
  const ref = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (ref.current && !isInternalChange.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
    isInternalChange.current = false;
  }, [value]);

  function exec(cmd) {
    ref.current?.focus();
    if (cmd.startsWith('formatBlock:')) {
      document.execCommand('formatBlock', false, cmd.split(':')[1]);
    } else if (cmd === 'createLink') {
      const url = prompt('Link URL:');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(cmd, false);
    }
    handleInput();
  }

  function handleInput() {
    isInternalChange.current = true;
    onChange(ref.current?.innerHTML || '');
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {BTNS.map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={() => exec(b.cmd)}
            style={{
              padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--bg-soft)', color: 'var(--text-dim)', ...b.style
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        style={{
          minHeight: 220, background: 'var(--bg-soft)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '12px 14px', fontSize: 14.5, lineHeight: 1.6, color: 'var(--text)'
        }}
      />
    </div>
  );
}
