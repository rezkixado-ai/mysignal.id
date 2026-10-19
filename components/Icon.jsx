// Tiny stroke-icon set shared by the public navbar and the admin CMS.
const PATHS = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v10h13V10',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5h.01',
  news: 'M5 4h11l3 3v13H5zM9 9h6M9 13h6M9 17h4',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  file: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  page: 'M6 3h9l4 4v14H6zM14 3v5h5',
  layers: 'M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5',
  chevron: 'M6 9l6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  more: 'M12 6h.01M12 12h.01M12 18h.01',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  eyeOff: 'M3 3l18 18M10.6 6.2A9.7 9.7 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.7M6.6 7.6A16.5 16.5 0 0 0 2 12s4 7 10 7a9.6 9.6 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  logout: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9',
  back: 'M15 6l-6 6 6 6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v4h16v-4',
  trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  shield: 'M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6z',
  cloud: 'M7 18a4 4 0 0 1-1-7.9A5 5 0 0 1 15.9 8 4.5 4.5 0 0 1 17 17H7z',
  globe: 'M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  pulse: 'M3 12h4l2-5 3 10 2-5h7',
  chip: 'M9 9h6v6H9zM4 9h2M4 15h2M18 9h2M18 15h2M9 4v2M15 4v2M9 18v2M15 18v2',
  building: 'M4 21V9l6-4 6 4v12M10 21v-6h4v6M4 9h16',
  chart: 'M4 19V9l5-3 5 3v10M14 19V6l6 3v10',
  cube: 'M12 3 4 7.5v9L12 21l8-4.5v-9L12 3zM4 7.5 12 12l8-4.5M12 12v9',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  reels: 'M4 5h16v14H4zM4 9h16M9 5l-2 4M15 5l-2 4M10 12.5v4l3.5-2z',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  bell: 'M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7zM10 20a2 2 0 0 0 4 0',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  brain: 'M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0 0 10v1a3 3 0 0 0 6 0V3z'
};

export default function Icon({ name, size = 20, strokeWidth = 1.8, className, style }) {
  return (
    <svg
      className={className} style={style} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <path d={PATHS[name] || ''} />
    </svg>
  );
}
