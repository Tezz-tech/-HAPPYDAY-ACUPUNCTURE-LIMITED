import { Picture } from '../ui/Picture.jsx';

/**
 * Text on one side, a photograph on the other. The photo is matched to the words beside it.
 * @param {{ photo: string, sizes?: string, reverse?: boolean, mediaAspectRatio?: string, children: import('react').ReactNode }} props
 */
export function SplitFeature({
  photo,
  sizes = '(min-width: 900px) 48vw, 92vw',
  reverse = false,
  mediaAspectRatio = '4 / 5',
  children,
}) {
  return (
    <div className={`split ${reverse ? 'split-reverse' : ''}`.trim()}>
      <div className="split-copy" data-reveal>
        {children}
      </div>
      <div className="split-media" data-reveal style={{ '--i': 1, '--split-media-aspect-ratio': mediaAspectRatio }}>
        <Picture id={photo} sizes={sizes} />
      </div>
    </div>
  );
}
