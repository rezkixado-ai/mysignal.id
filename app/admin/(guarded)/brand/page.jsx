'use client';
import ResourceManager from '../../../../components/admin/ResourceManager.jsx';

const config = {
  resource: 'brands', title: 'Brand', singular: 'Brand', primary: 'name', thumb: 'logo_url', publishKey: 'is_published', sortKey: 'sort_order',
  meta: (r) => [r.link_url],
  fields: [
    { key: 'logo_url', label: 'Logo', type: 'image', square: true, hint: 'PNG transparan lebih bagus' },
    { key: 'name', label: 'Nama brand', type: 'text', required: true },
    { key: 'link_url', label: 'Link (opsional)', type: 'url' },
    { key: 'sort_order', label: 'Urutan', type: 'number' },
    { key: 'is_published', label: 'Tampilkan', type: 'toggle' }
  ]
};
export default function Page() { return <ResourceManager config={config} />; }
