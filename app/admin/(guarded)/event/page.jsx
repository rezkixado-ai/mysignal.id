'use client';
import ResourceManager from '../../../../components/admin/ResourceManager.jsx';

const config = {
  resource: 'events', title: 'Event', singular: 'Event', primary: 'title', thumb: 'cover_url', publishKey: 'is_published',
  meta: (r) => [r.category, r.event_date ? String(r.event_date).slice(0, 10) : '', r.city],
  fields: [
    { key: 'cover_url', label: 'Cover event', type: 'image' },
    { key: 'title', label: 'Judul event', type: 'text', required: true },
    { key: 'category', label: 'Kategori', type: 'select', options: ['Teknologi', 'Networking', 'Cybersecurity', 'AI', 'Training', 'Lainnya'] },
    { key: 'event_date', label: 'Tanggal mulai', type: 'date' },
    { key: 'end_date', label: 'Tanggal selesai (opsional)', type: 'date' },
    { key: 'city', label: 'Kota', type: 'text' },
    { key: 'venue', label: 'Lokasi / venue', type: 'text' },
    { key: 'summary', label: 'Ringkasan', type: 'textarea', rows: 3 },
    { key: 'description', label: 'Deskripsi lengkap', type: 'textarea', rows: 6 },
    { key: 'register_url', label: 'Link pendaftaran', type: 'url' },
    { key: 'is_featured', label: 'Jadikan event utama', type: 'toggle' },
    { key: 'is_published', label: 'Published', type: 'toggle' }
  ]
};
export default function Page() { return <ResourceManager config={config} />; }
