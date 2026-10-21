'use client';
import ResourceManager from '../../../../components/admin/ResourceManager.jsx';
const rupiah = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

const CATS = ['Kabel FO', 'OLT/ONU', 'Tools', 'Aksesoris', 'Switch & Router', 'Lainnya'];
const config = {
  resource: 'products', title: 'Produk', singular: 'Produk', primary: 'name', thumb: 'image_url', publishKey: 'is_published', sortKey: 'sort_order',
  meta: (r) => [r.category, r.price ? rupiah(r.price) : 'Tanya harga'],
  fields: [
    { key: 'image_url', label: 'Foto produk', type: 'image' },
    { key: 'name', label: 'Nama produk', type: 'text', required: true, placeholder: 'Kabel Dropcore FTTH 1 Core' },
    { key: 'category', label: 'Kategori', type: 'select', options: CATS },
    { key: 'specs', label: 'Spesifikasi singkat', type: 'text', placeholder: 'G.657A1 | LSZH | 1 Core', hint: 'Pisahkan dengan tanda |' },
    { key: 'price', label: 'Harga (Rp)', type: 'number', hint: 'Kosongkan jika harga ditanyakan ke sales' },
    { key: 'price_unit', label: 'Satuan', type: 'text', placeholder: '/ Roll 1 Km' },
    { key: 'badge', label: 'Badge', type: 'text', placeholder: 'Best Seller' },
    { key: 'description', label: 'Deskripsi', type: 'textarea' },
    { key: 'features', label: 'Fitur utama', type: 'textarea', hint: 'Satu fitur per baris' },
    { key: 'sort_order', label: 'Urutan', type: 'number' },
    { key: 'is_featured', label: 'Tampil di Produk Pilihan (Home)', type: 'toggle' },
    { key: 'is_published', label: 'Published', type: 'toggle' }
  ]
};
export default function Page() { return <ResourceManager config={config} />; }
