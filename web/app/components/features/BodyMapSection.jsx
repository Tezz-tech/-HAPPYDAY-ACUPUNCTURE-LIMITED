import { useState } from 'react';
import { RegionList } from './RegionList.jsx';

/**
 * "Where does it hurt?" (docs/03 home §2). Phase 2 renders the accessible region list.
 * Phase 3 puts the SVG figure above it, and both drive the same selection.
 */
export function BodyMapSection() {
  const [selected, setSelected] = useState(null);
  return <RegionList selected={selected} onSelect={(id) => setSelected((cur) => (cur === id ? null : id))} />;
}
