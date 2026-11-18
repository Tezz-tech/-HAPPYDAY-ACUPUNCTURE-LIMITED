import { useState } from 'react';
import { BodyMap } from './BodyMap.jsx';
import { RegionList } from './RegionList.jsx';

/**
 * "Where does it hurt?" (docs/03 home §2, docs/02 §5.4). The figure and the accessible list share one
 * selection. The figure is a pointer convenience; the list is the keyboard and screen-reader path.
 */
export function BodyMapSection() {
  const [selected, setSelected] = useState(null);
  const pick = (id) => setSelected((cur) => (cur === id ? null : id));
  return (
    <div className="body-map-section">
      <BodyMap selected={selected} onSelect={pick} />
      <RegionList selected={selected} onSelect={pick} />
    </div>
  );
}
