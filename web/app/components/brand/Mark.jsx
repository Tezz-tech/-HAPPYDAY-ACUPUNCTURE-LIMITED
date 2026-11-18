/**
 * The simplified mark for small sizes (header, favicon, loading states, confirmation). docs/02 §3.
 * @param {{ tone?: 'light' | 'dark', size?: number, className?: string }} props
 */
export function Mark({ tone = 'light', size = 36, className = '' }) {
  const src = tone === 'dark' ? '/brand/mark-on-dark.svg' : '/brand/mark-color.svg';
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      decoding="async"
      className={className}
    />
  );
}
