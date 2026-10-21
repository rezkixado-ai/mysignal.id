// Konten contoh yang dipakai otomatis saat tabel belum ada / masih kosong.
// Begitu lo isi data asli (lewat CMS / SQL), bagian terkait otomatis pakai data asli.

export const DEFAULT_SETTINGS = {
  wa_number: '6281234567890',
  hero_eyebrow: 'FIBER OPTIC • NETWORK EQUIPMENT • INFRASTRUCTURE',
  hero_title_1: 'CONNECTIVITY,',
  hero_title_2: 'WITHOUT LIMITS',
  hero_desc: 'Kabel fiber optik dan perangkat jaringan untuk konektivitas tanpa batas di seluruh Indonesia.',
  hero_side_text: 'CONNECTING A BRIGHTER INDONESIA',
  stat_1_value: '500+', stat_1_label: 'PRODUK', stat_1_sub: 'KABEL & PERANGKAT JARINGAN',
  stat_2_value: '100+', stat_2_label: 'KLIEN', stat_2_sub: 'ISP, OPERATOR & ENTERPRISE',
  stat_3_value: '24/7', stat_3_label: 'DUKUNGAN TEKNIS', stat_3_sub: 'KONSULTASI & AFTER SALES',
  vision_title: 'MENGHUBUNGKAN INDONESIA LEBIH JAUH',
  vision_body: 'Menjadi mitra terpercaya dalam penyediaan kabel fiber optik dan perangkat jaringan untuk mendukung pemerataan konektivitas di seluruh Indonesia.',
  mission_title: 'INFRASTRUKTUR JARINGAN YANG ANDAL DAN BERKUALITAS',
  mission_body: 'Menyediakan produk berkualitas, solusi yang tepat, serta dukungan teknis profesional untuk membangun ekosistem jaringan yang lebih baik.',
  footer_tagline: 'Penyedia kabel fiber optik dan perangkat jaringan berkualitas untuk konektivitas tanpa batas di Indonesia.',
  social_instagram: '#', social_youtube: '#', social_linkedin: '#',
  about_hero_title: 'KENAPA THE XI:GNAL?',
  about_hero_desc: 'Berangkat dari antusiasme dan respect yang besar dari founder The Xi:gnal.',
  about_cta_title: 'UNTUK INDONESIA YANG LEBIH TERKONEKSI',
  about_cta_body: 'Kami percaya teknologi dapat membuka lebih banyak peluang, memperkuat komunitas dan menciptakan masa depan yang lebih baik.',
  contact_email: 'hello@mysignal.id',
  font_heading: 'red-hat',
  font_body: 'inter',
  article_author_name: 'Admin Xi:gnal',
  article_author_role: 'Content Creator · Xignal',
  article_author_photo: '',
  // ---- popup voucher promo (Admin → Promo Popup) ----
  promo_enabled: '0',
  promo_eyebrow: 'PROMO TERBATAS',
  promo_title: 'Jangan pergi dulu!',
  promo_code: 'XIGNAL10',
  promo_desc: 'Pakai kode ini untuk diskon 10% pembelian pertama kabel fiber optik dan perangkat jaringan.',
  promo_cta_label: 'Klaim via WhatsApp',
  promo_cta_url: '',
  promo_image_url: '',
  promo_start: '',
  promo_end: '',
  promo_trigger: 'delay',
  promo_delay: '8',
  promo_scroll: '40',
  promo_frequency: 'session',
  promo_pages: 'all',
  promo_device: 'all',
  promo_countdown: 'minutes',
  promo_countdown_minutes: '15',
  promo_countdown_label: 'Kode ini kedaluwarsa dalam',
  // sisi kanan: 'auto' = gambar kalau ada, kalau tidak angka. Pilihan: image | number | both
  promo_visual: 'auto',
  promo_number: '10',
  promo_number_prefix: '',
  promo_number_suffix: '%',
  promo_number_label: 'DISKON',
  promo_number_anim: 'loop',
  promo_number_secs: '2.2',
  promo_bg_mode: 'on',
  promo_bg_video_url: ''
};

export const FALLBACK_PRODUCTS = [
  { id: 1, slug: 'kabel-dropcore-ftth-1-core', name: 'Kabel Dropcore FTTH 1 Core', category: 'Kabel FO', specs: 'G.657A1 | LSZH | 1 Core', price: 350000, price_unit: '/ Roll 1 Km', badge: 'Best Seller', image_url: '', description: 'Kabel dropcore FTTH 1 core untuk instalasi last-mile pelanggan rumahan dan bisnis.', features: 'Standar G.657A1\nSelubung LSZH\nFlexible dan tahan tekukan' },
  { id: 2, slug: 'onu-ont-gpon', name: 'ONU/ONT GPON', category: 'OLT/ONU', specs: '1GE | 1FE | 1PON | WiFi', price: 185000, price_unit: '/ Unit', badge: '', image_url: '', description: 'ONU/ONT GPON dengan WiFi untuk layanan FTTH.', features: 'Port 1GE + 1FE\nWiFi\nKompatibel OLT populer' },
  { id: 3, slug: 'olt-gpon-4-port', name: 'OLT GPON 4 Port', category: 'OLT/ONU', specs: '4 PON | 4GE | Managed', price: 2750000, price_unit: '/ Unit', badge: '', image_url: '', description: 'OLT GPON 4 port managed untuk ISP dan WISP skala kecil sampai menengah.', features: '4 port PON\n4 port GE\nManagement via web/CLI' },
  { id: 4, slug: 'fusion-splicer', name: 'Fusion Splicer', category: 'Tools', specs: 'Core Alignment | Fast Splicing', price: 8500000, price_unit: '/ Unit', badge: '', image_url: '', description: 'Fusion splicer core alignment dengan proses splicing cepat untuk teknisi lapangan.', features: 'Core alignment\nFast splicing\nLayar sentuh' }
];

export const FALLBACK_VIDEOS = [
  { id: 1, title: 'Instalasi jaringan FTTH di perumahan', platform: 'Reels', views_label: '12.4K', thumb_url: '', link_url: '#' },
  { id: 2, title: 'Persiapan kabel dropcore sebelum instalasi', platform: 'Reels', views_label: '8.7K', thumb_url: '', link_url: '#' },
  { id: 3, title: 'Penataan OLT di ruang server', platform: 'Reels', views_label: '15.2K', thumb_url: '', link_url: '#' },
  { id: 4, title: 'Proses fusion splicing kabel fiber optik', platform: 'Reels', views_label: '11.9K', thumb_url: '', link_url: '#' }
];

export const FALLBACK_ARTICLES = [
  { id: 1, slug: '', title: 'Apa Itu Kabel Fiber Optik? Pengertian, Jenis dan Kelebihannya', category: 'Fiber Optik', excerpt: 'Panduan lengkap mengenal kabel fiber optik dan manfaatnya untuk jaringan modern.', cover_media_url: '', published_at: '2026-10-12', read_minutes: 8 },
  { id: 2, slug: '', title: 'Mengenal Teknologi FTTH dan Manfaatnya untuk Layanan Internet', category: 'Networking', excerpt: 'FTTH menjadi solusi koneksi internet stabil dan cepat untuk rumah dan bisnis.', cover_media_url: '', published_at: '2026-10-08', read_minutes: 6 },
  { id: 3, slug: '', title: 'Cara Memilih OLT GPON yang Tepat untuk Kebutuhan Jaringan Anda', category: 'Produk', excerpt: 'Tips memilih OLT sesuai skala jaringan, fitur dan kebutuhan operasional.', cover_media_url: '', published_at: '2026-10-05', read_minutes: 7 },
  { id: 4, slug: '', title: 'Langkah-langkah Fusion Splicing Kabel Fiber Optik dengan Benar', category: 'Teknis', excerpt: 'Panduan teknis splicing agar hasil sambungan stabil dan minim loss.', cover_media_url: '', published_at: '2026-10-01', read_minutes: 5 },
  { id: 5, slug: '', title: '5 Masalah Umum Jaringan Fiber Optik dan Cara Mengatasinya', category: 'Troubleshooting', excerpt: 'Kenali masalah umum dan solusi praktis untuk menjaga performa jaringan.', cover_media_url: '', published_at: '2026-09-28', read_minutes: 6 },
  { id: 6, slug: '', title: 'Peran Infrastruktur Digital dalam Mendukung Transformasi Indonesia', category: 'Internet', excerpt: 'Infrastruktur jaringan sebagai fondasi pertumbuhan ekonomi digital.', cover_media_url: '', published_at: '2026-09-20', read_minutes: 6 }
];

export const FALLBACK_EVENTS = [
  { id: 1, slug: 'fttx-class-bandung-2026', title: 'FTTx Class Bandung 2026', category: 'Teknologi', event_date: '2026-10-28', end_date: '2026-10-29', city: 'Bandung', venue: 'Hotel Asrilia, Bandung', summary: 'Pelatihan intensif FTTH dari instalasi, konfigurasi dan troubleshooting bersama praktisi berpengalaman.', description: '', cover_url: '', register_url: '#', is_featured: 1 },
  { id: 2, slug: 'workshop-instalasi-splicing', title: 'Workshop Instalasi dan Splicing Fiber Optik', category: 'Teknologi', event_date: '2026-10-12', end_date: '', city: 'Surabaya', venue: 'Surabaya, Jawa Timur', summary: 'Pelatihan praktik instalasi dan splicing fiber optik untuk teknisi lapangan.', description: '', cover_url: '', register_url: '#', is_featured: 0 },
  { id: 3, slug: 'community-gathering-isp', title: 'Community Gathering ISP & Operator', category: 'Networking', event_date: '2026-10-05', end_date: '', city: 'Jakarta', venue: 'Jakarta', summary: 'Temu komunitas dan diskusi perkembangan industri ISP di Indonesia.', description: '', cover_url: '', register_url: '#', is_featured: 0 },
  { id: 4, slug: 'seminar-cyber-security', title: 'Seminar Cyber Security untuk Infrastruktur Vital', category: 'Cybersecurity', event_date: '2026-09-28', end_date: '', city: 'Medan', venue: 'Medan', summary: 'Membahas strategi keamanan siber untuk infrastruktur kritis di era digital.', description: '', cover_url: '', register_url: '#', is_featured: 0 },
  { id: 5, slug: 'ai-network-automation-workshop', title: 'AI for Network Automation Workshop', category: 'AI', event_date: '2026-09-20', end_date: '', city: 'Bandung', venue: 'Bandung', summary: 'Eksplorasi pemanfaatan AI untuk manajemen jaringan yang lebih efisien.', description: '', cover_url: '', register_url: '#', is_featured: 0 },
  { id: 6, slug: 'product-demo-solution-day', title: 'Product Demo & Solution Day', category: 'Teknologi', event_date: '2026-09-15', end_date: '', city: 'Surabaya', venue: 'Surabaya', summary: 'Demo perangkat terbaru dan solusi lengkap untuk kebutuhan jaringan Anda.', description: '', cover_url: '', register_url: '#', is_featured: 0 },
  { id: 7, slug: 'xignal-tech-talk', title: 'Xi:gnal Tech Talk: Konektivitas Masa Depan', category: 'Networking', event_date: '2026-09-08', end_date: '', city: 'Online', venue: 'Online', summary: 'Diskusi insight teknologi bersama expert dan praktisi industri.', description: '', cover_url: '', register_url: '#', is_featured: 0 }
];

export const FALLBACK_BRANDS = [
  { id: 1, name: 'Xignal', logo_url: '' },
  { id: 2, name: 'FALCOM', logo_url: '' },
  { id: 3, name: 'FASTLINK', logo_url: '' },
  { id: 4, name: 'XADO', logo_url: '' }
];

export const FALLBACK_TIMELINE = [
  { id: 1, year_label: '2022', title: '', body: 'Rasa ingin tahu: mulai mempelajari industri teknologi dan dunia internet.', icon: 'bulb' },
  { id: 2, year_label: '2023 - 2024', title: '', body: 'Mendalami teknologi jaringan, infrastruktur, dan cara dunia saling terhubung.', icon: 'layers' },
  { id: 3, year_label: '2025', title: '', body: 'Eksplorasi yang makin spesifik pada sistem, keamanan, dan teknologi digital.', icon: 'gear' },
  { id: 4, year_label: '2026', title: '', body: 'Fokus berkembang ke cybersecurity dan Artificial Intelligence (AI).', icon: 'chart' }
];

export const FALLBACK_FOUNDERS = [
  { id: 1, name: 'Founder', role: 'Technology Explorer', tags: 'Network • Security • AI', bio: 'Antusiasme pada teknologi dan bagaimana dunia digital saling terhubung. Setiap hari belajar, membangun, dan berbagi insight.', photo_url: '' },
  { id: 2, name: 'Founder', role: 'Content & Community', tags: 'Tech Education • Event • Collaboration', bio: 'Membangun komunitas dan konten edukatif supaya teknologi bisa dipahami lebih banyak orang.', photo_url: '' },
  { id: 3, name: 'Founder', role: 'Infrastructure', tags: 'Fiber Optic • FTTH • ISP', bio: 'Berpengalaman di infrastruktur jaringan fiber optik dan layanan ISP.', photo_url: '' }
];
