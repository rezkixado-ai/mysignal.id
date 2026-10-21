'use client';

import { motion } from 'motion/react';

/* template.jsx dibuat ulang tiap pindah halaman, jadi ini memberi transisi masuk yang mulus.
   Hanya opacity (bukan transform) supaya bar tombol fixed (simpan/editor) tidak bergeser. */
export default function Template({ children }) {
  return (
    <motion.div className="xa-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
