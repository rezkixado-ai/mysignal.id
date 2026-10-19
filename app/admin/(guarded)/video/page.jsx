'use client';
import ResourceManager from '../../../../components/admin/ResourceManager.jsx';

const config = {
  resource: 'videos', title: 'Video / Reels', singular: 'Video', primary: 'title', thumb: 'thumb_url', publishKey: 'is_published', sortKey: 'sort_order',
  meta: (r) => [r.platform, r.views_label && `${r.views_label} views`],
  fields: [
    { key: 'thumb_url', label: 'Thumbnail', type: 'image' },
    { key: 'title', label: 'Judul', type: 'text', required: true },
    { key: 'platform', label: 'Platform', type: 'select', options: ['Reels', 'YouTube', 'TikTok'] },
    { key: 'views_label', label: 'Jumlah views (teks)', type: 'text', placeholder: '12.4K' },
    { key: 'link_url', label: 'Link video', type: 'url' },
    { key: 'sort_order', label: 'Urutan', type: 'number' },
    { key: 'is_published', label: 'Published', type: 'toggle' }
  ]
};
export default function Page() { return <ResourceManager config={config} />; }
