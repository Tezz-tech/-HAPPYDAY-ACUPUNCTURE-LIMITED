import { useEffect, useRef, useState } from 'react';
import { bodyRegions } from '../../content/index.js';
import { prefersReducedMotion } from '../../lib/motion.js';
import { Button } from '../ui/Button.jsx';
import { SegmentedControl } from '../ui/SegmentedControl.jsx';

// Hand-authored line figure, gender-neutral, no facial features (docs/02 §5.4).
// Each region is a <g> hit-area whose id matches content/body-map.json.
// The figure is decorative to assistive tech: the region list beside it carries the same function.

const mirror = (pts) => pts.map(([x, y]) => [200 - x, y]);
const poly = (pts) => `M${pts.map(([x, y]) => `${x} ${y}`).join(' L')} Z`;

const LEFT_LEG = [
  [68, 238],
  [98, 238],
  [96, 330],
  [100, 404],
  [84, 404],
  [80, 330],
  [66, 252],
];
const LEFT_ARM = [
  [58, 98],
  [68, 110],
  [52, 186],
  [36, 266],
  [26, 262],
  [40, 176],
];

/** Each shape belongs to one region and to the views it appears in. */
const SHAPES = [
  { id: 'whole-body', views: ['front', 'back'], d: 'M14 10 H186 V414 H14 Z', hit: true },
  { id: 'head-face', views: ['front', 'back'], ellipse: { cx: 100, cy: 36, rx: 19, ry: 25 } },
  { id: 'neck-shoulders', views: ['front', 'back'], d: poly([[86, 66], [114, 66], [150, 84], [142, 98], [58, 98], [50, 84]]) },
  { id: 'arms-hands', views: ['front', 'back'], d: poly(LEFT_ARM) },
  { id: 'arms-hands', views: ['front', 'back'], d: poly(mirror(LEFT_ARM)) },
  { id: 'abdomen', views: ['front'], d: poly([[74, 124], [126, 124], [124, 196], [76, 196]]) },
  { id: 'back-hips', views: ['back'], d: poly([[72, 124], [128, 124], [136, 208], [64, 208]]) },
  { id: 'pelvis', views: ['front'], d: poly([[76, 196], [124, 196], [132, 238], [68, 238]]) },
  { id: 'knees-legs', views: ['front', 'back'], d: poly(LEFT_LEG) },
  { id: 'knees-legs', views: ['front', 'back'], d: poly(mirror(LEFT_LEG)) },
];

/** Where the needle lands for each region. */
const CENTRES = {
  'head-face': [100, 36],
  'neck-shoulders': [100, 82],
  'arms-hands': [44, 190],
  'back-hips': [100, 166],
  abdomen: [100, 160],
  pelvis: [100, 217],
  'knees-legs': [84, 320],
  'whole-body': [100, 200],
};

const VIEW_OPTIONS = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
];

/**
 * The "Where does it hurt?" figure (docs/02 §5.4). Selecting a region plays a needle-drop onto its centre.
 * The Front/Back toggle squashes the figure to zero width and expands it again over 380 ms.
 * @param {{ selected: string | null, onSelect: (id: string) => void }} props
 */
export function BodyMap({ selected, onSelect }) {
  const [view, setView] = useState('front');
  const [flipping, setFlipping] = useState(false);
  const [hovered, setHovered] = useState(null);
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  function changeView(next) {
    if (next === view) return;
    if (prefersReducedMotion()) {
      setView(next);
      return;
    }
    setFlipping(true);
    timer.current = setTimeout(() => {
      setView(next);
      setFlipping(false);
    }, 190);
  }

  const regionIds = new Set(bodyRegions.filter((r) => r.views.includes(view)).map((r) => r.id));
  const centre = selected ? CENTRES[selected] : null;

  return (
    <div className="body-map">
      <div className="body-map-toolbar">
        <SegmentedControl label="View" value={view} onChange={changeView} options={VIEW_OPTIONS} />
      </div>
      <div className={`body-map-figure ${flipping ? 'is-flipping' : ''}`.trim()}>
        <svg
          className="body-map-svg"
          viewBox="0 0 200 420"
          role="img"
          aria-label="Line figure of the body. Use the list below to choose an area."
          focusable="false"
        >
          {SHAPES.filter((s) => s.views.includes(view) && (s.id === 'whole-body' || regionIds.has(s.id))).map((s, i) => {
            const classes = [
              'body-region',
              s.hit ? 'is-hit' : '',
              selected === s.id ? 'is-selected' : '',
              hovered === s.id ? 'is-hover' : '',
            ]
              .filter(Boolean)
              .join(' ');
            const common = {
              className: classes,
              onClick: () => onSelect(s.id),
              onPointerEnter: () => setHovered(s.id),
              onPointerLeave: () => setHovered(null),
            };
            const key = `${view}-${s.id}-${i}`;
            return s.ellipse ? (
              <ellipse
                key={key}
                {...common}
                cx={s.ellipse.cx}
                cy={s.ellipse.cy}
                rx={s.ellipse.rx}
                ry={s.ellipse.ry}
              />
            ) : (
              <path key={key} {...common} d={s.d} />
            );
          })}
          {/* Outline of the figure, drawn on top so the lines stay crisp. */}
          <g className="body-outline" aria-hidden="true" pointerEvents="none">
            <ellipse cx="100" cy="36" rx="19" ry="25" />
            <path d="M86 66 L114 66 L150 84 L168 262 L134 266 L126 244 L132 404 L100 404 L98 330 L96 404 L68 404 L74 244 L66 266 L32 262 L50 84 Z" />
          </g>
          {centre ? (
            <g key={selected} className="needle-drop" aria-hidden="true">
              <line x1={centre[0]} y1={centre[1] - 150} x2={centre[0]} y2={centre[1]} />
              <circle cx={centre[0]} cy={centre[1]} r="3" />
              <circle className="needle-ripple" cx={centre[0]} cy={centre[1]} r="3" />
            </g>
          ) : null}
        </svg>
      </div>
      <div className="body-map-actions">
        <Button variant="ghost" onClick={() => onSelect('whole-body')}>
          Whole body &amp; mind
        </Button>
      </div>
    </div>
  );
}
