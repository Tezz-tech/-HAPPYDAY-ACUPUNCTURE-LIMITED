import { Mark } from './Mark.jsx';

/**
 * Reserved portrait slot for the founder (docs/02 §5.7). Until the client supplies a portrait, the
 * slot shows the mark on forest-900 with a caption. A stock face is never used.
 * @param {{ className?: string }} props
 */
export function PortraitSlot({ className = '' }) {
  return (
    <figure className={`portrait-slot ${className}`.trim()}>
      <div className="portrait-slot-frame">
        <Mark tone="dark" size={72} />
      </div>
      <figcaption className="pic-caption">Portrait coming soon.</figcaption>
    </figure>
  );
}
