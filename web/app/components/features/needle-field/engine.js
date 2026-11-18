// The needle field: a canvas of fine needles that lean toward the pointer (docs/02 §5.3).
// Plain JavaScript with no React inside, so the render loop never touches component state.

const STIFFNESS = 120;
const DAMPING = 14;
const LEAN_RADIUS = 160;
const MAX_LEAN = 0.9;
const JADE = [157, 184, 164];
const GOLD = [217, 186, 63];

/** Small deterministic random source, so the layout is the same on every visit. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ reduced?: boolean }} [opts]
 * @returns {{ destroy: () => void, setScale: (s: number) => void, grow: () => void }}
 */
export function createNeedleField(canvas, opts = {}) {
  const reduced = Boolean(opts.reduced);
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  let needles = [];
  let scale = 1;
  let growT = 1; // 0 to 1, drives the diagonal growth on entry
  let growStart = 0;
  let raf = 0;
  let running = false;
  let visible = true;
  let last = 0;
  let t0 = 0;
  let lastAmbient = 0;
  const pointer = { x: -1e4, y: -1e4, active: false };
  const ripples = [];

  function layout() {
    const count = w < 640 ? 70 : 140;
    const aspect = w / Math.max(h, 1);
    const cols = Math.max(1, Math.ceil(Math.sqrt(count * aspect)));
    const rows = Math.max(1, Math.ceil(count / cols));
    const cw = w / cols;
    const ch = h / rows;
    const rand = rng(42);
    needles = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = (c + 0.5 + (rand() - 0.5) * 0.7) * cw;
        const y = (r + 0.5 + (rand() - 0.5) * 0.7) * ch;
        needles.push({
          x,
          y,
          len: 28 + rand() * 16,
          base: (rand() - 0.5) * 0.5,
          phase: rand() * Math.PI * 2,
          lean: 0,
          vel: 0,
          warm: 0,
          grow: 0,
          delay: (x / Math.max(w, 1) + y / Math.max(h, 1)) * 0.5, // diagonal wave
        });
      }
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
  }

  function headOf(n, angle) {
    const len = n.len * scale * n.grow;
    return { hx: n.x + Math.sin(angle) * len, hy: n.y - Math.cos(angle) * len };
  }

  function step(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000;

    if (growT < 1) {
      growT = Math.min(1, (now - growStart) / 1100);
    }
    // Ambient ripple every 8 seconds while the visitor is idle.
    if (!pointer.active && now - lastAmbient > 8000) {
      lastAmbient = now;
      ripples.push({ x: w * (0.3 + Math.random() * 0.4), y: h * 0.5, born: now });
    }
    for (let i = ripples.length - 1; i >= 0; i -= 1) {
      if (now - ripples[i].born > 2600) ripples.splice(i, 1);
    }

    for (const n of needles) {
      const stagger = Math.min(1, Math.max(0, (growT - n.delay * 0.5) / 0.5));
      n.grow = stagger;

      const idle = Math.sin(t * 0.6 + n.phase) * 0.035; // about ±2 degrees
      let target = 0;
      let strength = 0;
      if (pointer.active) {
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < LEAN_RADIUS) {
          strength = 1 - d / LEAN_RADIUS;
          target = Math.max(-MAX_LEAN, Math.min(MAX_LEAN, Math.atan2(dx, -dy) * strength));
        }
      }
      for (const rip of ripples) {
        const age = (now - rip.born) / 1000;
        const front = age * 220;
        const d = Math.hypot(n.x - rip.x, n.y - rip.y);
        const band = Math.exp(-Math.pow((d - front) / 26, 2));
        target += band * 0.35 * (1 - age / 2.6) * Math.sign(n.x - rip.x || 1);
      }

      // Damped spring toward the target lean.
      const acc = STIFFNESS * (target - n.lean) - DAMPING * n.vel;
      n.vel += acc * dt;
      n.lean += n.vel * dt;
      n.angle = n.base + idle + n.lean;
      n.warm = strength;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const bands = [
      { min: 0, color: JADE, pts: [] },
      { min: 0.34, color: [], pts: [] },
      { min: 0.67, color: GOLD, pts: [] },
    ];
    for (const n of needles) {
      if (n.grow <= 0) continue;
      const { hx, hy } = headOf(n, n.angle);
      const warm = n.warm;
      const band = warm > 0.67 ? bands[2] : warm > 0.34 ? bands[1] : bands[0];
      band.pts.push(n.x, n.y, hx, hy);
      if (band === bands[1]) {
        const mix = Math.min(1, (warm - 0.34) / 0.33);
        band.color = JADE.map((c, i) => Math.round(c + (GOLD[i] - c) * mix));
      }
    }
    for (const band of bands) {
      if (band.pts.length === 0) continue;
      ctx.strokeStyle = `rgb(${band.color[0]} ${band.color[1]} ${band.color[2]})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < band.pts.length; i += 4) {
        ctx.moveTo(band.pts[i], band.pts[i + 1]);
        ctx.lineTo(band.pts[i + 2], band.pts[i + 3]);
      }
      ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      for (let i = 0; i < band.pts.length; i += 4) {
        ctx.moveTo(band.pts[i + 2] + 2.5, band.pts[i + 3]);
        ctx.arc(band.pts[i + 2], band.pts[i + 3], 2.5, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }

  function frame(now) {
    if (!running) return;
    step(now);
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = e.pointerType !== 'touch';
  }
  function onPointerLeave() {
    pointer.active = false;
  }
  function onPointerDown(e) {
    if (e.pointerType !== 'touch') return;
    const rect = canvas.getBoundingClientRect();
    ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, born: performance.now() });
  }
  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  resize();
  t0 = performance.now();
  growStart = t0;

  if (reduced) {
    // One calm static frame, fully grown, no motion (docs/02 §6).
    growT = 1;
    for (const n of needles) {
      n.grow = 1;
      n.angle = n.base;
      n.warm = 0;
    }
    draw();
  } else {
    lastAmbient = t0;
    growT = 0;
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('visibilitychange', onVisibility);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    canvas._io = io;
    start();
  }

  const onResize = () => {
    resize();
    if (reduced) {
      for (const n of needles) {
        n.grow = 1;
        n.angle = n.base;
      }
      draw();
    }
  };
  window.addEventListener('resize', onResize);

  return {
    destroy() {
      stop();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas._io?.disconnect();
      ctx.clearRect(0, 0, w, h);
    },
    setScale(s) {
      scale = Math.max(0, Math.min(1, s));
      if (reduced) draw();
    },
    grow() {
      growT = 0;
      growStart = performance.now();
    },
  };
}
