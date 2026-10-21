import SIcon from './SIcon.jsx';
import AutoVideo from './AutoVideo.jsx';

// Gambar dari CMS, atau blok placeholder bergradien kalau belum diupload.
export default function Media({ src, alt = '', icon = 'fiber', video = false, className = '', ...rest }) {
  if (src && video) return <AutoVideo className={className} src={src} {...rest} />;
  if (src) return <img className={className} src={src} alt={alt} loading="lazy" {...rest} />;
  return (
    <span className={`x-ph ${className}`} role="img" aria-label={alt}>
      <SIcon name={icon} size={34} sw={1.4} />
    </span>
  );
}
