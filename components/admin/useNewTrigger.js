'use client';

import { useEffect, useRef } from 'react';

// Lets the "+" sheet / dashboard shortcuts open a page's "new item" form.
// Works both when arriving via /admin/xxx?new=1 and when already on that page
// (the shell dispatches an "adm:new" event instead of navigating).
export default function useNewTrigger(callback) {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(() => {
    const fire = () => ref.current();
    if (new URLSearchParams(window.location.search).get('new') === '1') {
      fire();
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.addEventListener('adm:new', fire);
    return () => window.removeEventListener('adm:new', fire);
  }, []);
}
