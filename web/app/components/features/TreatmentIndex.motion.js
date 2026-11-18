// Cursor-following photo preview for the treatment index (docs/02 §6). Fine pointers only.
// The preview eases toward the pointer with a lerp of 0.12, and tilts by up to ±3° with horizontal velocity.
import { hasFinePointer, prefersReducedMotion } from '../../lib/motion.js';

/**
 * @param {HTMLElement} list the <ul> of treatment rows
 * @param {HTMLElement} preview the floating image element
 * @returns {() => void} cleanup
 */
export function attachCursorPreview(list, preview) {
  if (!hasFinePointer() || prefersReducedMotion()) return () => {};

  const target = { x: 0, y: 0 };
  const pos = { x: 0, y: 0 };
  let lastX = 0;
  let vx = 0;
  let frame = 0;
  let visible = false;

  function tick() {
    pos.x += (target.x - pos.x) * 0.12;
    pos.y += (target.y - pos.y) * 0.12;
    vx += (target.vx ?? 0) - vx;
    const tilt = Math.max(-3, Math.min(3, vx * 0.15));
    preview.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
    frame = requestAnimationFrame(tick);
  }

  function onMove(e) {
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    target.vx = dx;
    target.x = e.clientX + 24;
    target.y = e.clientY - 110;
    if (!visible) {
      pos.x = target.x;
      pos.y = target.y;
    }
  }

  function onOver(e) {
    const row = e.target.closest('.treatment-row');
    const id = row?.dataset.preview;
    if (!id) return;
    preview.querySelectorAll('img').forEach((img) => {
      img.hidden = img.dataset.for !== id;
    });
    preview.classList.add('is-on');
    visible = true;
  }

  function onOut(e) {
    if (!e.relatedTarget || !list.contains(e.relatedTarget)) {
      preview.classList.remove('is-on');
      visible = false;
    }
  }

  list.addEventListener('pointermove', onMove);
  list.addEventListener('pointerover', onOver);
  list.addEventListener('pointerout', onOut);
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    list.removeEventListener('pointermove', onMove);
    list.removeEventListener('pointerover', onOver);
    list.removeEventListener('pointerout', onOut);
  };
}
