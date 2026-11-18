/**
 * Icons are used only where they do a job (CLAUDE.md): WhatsApp, phone, map pin, chevrons,
 * close, copy and check. The WhatsApp glyph is the CC0 Simple Icons path.
 */

const PATHS = {
  whatsapp: { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z", fill: true, box: '0 0 24 24' },
  phone: {
    d: 'M5 4h3.2l1.6 4.2-2 1.3a11 11 0 0 0 6.7 6.7l1.3-2 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z',
    box: '0 0 24 24',
  },
  pin: {
    d: 'M12 21s-6.5-6.1-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.9 12 21 12 21Z M12 12.2a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z',
    box: '0 0 24 24',
  },
  chevron: { d: 'M9 6l6 6-6 6', box: '0 0 24 24' },
  'chevron-down': { d: 'M6 9l6 6 6-6', box: '0 0 24 24' },
  arrow: { d: 'M5 12h13M13 6l6 6-6 6', box: '0 0 24 24' },
  close: { d: 'M6 6l12 12M18 6L6 18', box: '0 0 24 24' },
  alert: { d: 'M12 3.8a8.2 8.2 0 1 0 0 16.4 8.2 8.2 0 0 0 0-16.4Zm0 4.6v4.6m0 2.9v.2', box: '0 0 24 24' },
  plus: { d: 'M12 5v14M5 12h14', box: '0 0 24 24' },
  copy: {
    d: 'M9 9h10v11H9zM5 15V4h11',
    box: '0 0 24 24',
  },
  check: { d: 'M5 12.5l4.5 4.5L19 7.5', box: '0 0 24 24' },
};

/**
 * @param {{ name: keyof typeof PATHS, size?: number, className?: string, label?: string }} props
 * Decorative by default. Pass `label` only when the icon is the sole content of a control.
 */
export function Icon({ name, size = 20, className, label }) {
  const icon = PATHS[name];
  if (!icon) throw new Error(`Unknown icon: ${name}`);
  const stroke = icon.fill ? undefined : 'currentColor';
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={icon.box}
      fill={icon.fill ? 'currentColor' : 'none'}
      stroke={stroke}
      strokeWidth={icon.fill ? undefined : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      <path d={icon.d} />
    </svg>
  );
}
