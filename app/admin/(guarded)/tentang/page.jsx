'use client';
import { useState } from 'react';
import ResourceManager from '../../../../components/admin/ResourceManager.jsx';

const ICONS = ['bulb', 'layers', 'gear', 'chart', 'network', 'fiber', 'target', 'globe', 'star', 'cube'];
const timeline = {
  resource: 'timeline', title: 'Perjalanan Kami', singular: 'Tahap', primary: 'year_label', sortKey: 'sort_order',
  meta: (r) => [r.title, (r.body || '').slice(0, 50)],
  fields: [
    { key: 'year_label', label: 'Tahun / periode', type: 'text', required: true, placeholder: '2023 - 2024' },
    { key: 'title', label: 'Judul (opsional)', type: 'text' },
    { key: 'body', label: 'Cerita', type: 'textarea' },
    { key: 'icon', label: 'Ikon', type: 'select', options: ICONS },
    { key: 'sort_order', label: 'Urutan', type: 'number' }
  ]
};
const founders = {
  resource: 'founders', title: 'Founder', singular: 'Founder', primary: 'name', thumb: 'photo_url', sortKey: 'sort_order',
  meta: (r) => [r.role],
  fields: [
    { key: 'photo_url', label: 'Foto', type: 'image', square: true },
    { key: 'name', label: 'Nama', type: 'text', required: true },
    { key: 'role', label: 'Peran', type: 'text' },
    { key: 'tags', label: 'Tag keahlian', type: 'text', hint: 'Pisahkan dengan koma' },
    { key: 'bio', label: 'Bio singkat', type: 'textarea' },
    { key: 'sort_order', label: 'Urutan', type: 'number' }
  ]
};
export default function Page() {
  const [tab, setTab] = useState('timeline');
  return (
    <div>
      <div className="xa-tabs">
        <button type="button" className={`pill${tab === 'timeline' ? ' on' : ''}`} onClick={() => setTab('timeline')}>Timeline</button>
        <button type="button" className={`pill${tab === 'founders' ? ' on' : ''}`} onClick={() => setTab('founders')}>Founders</button>
      </div>
      <ResourceManager key={tab} config={tab === 'timeline' ? timeline : founders} />
    </div>
  );
}
