/* =========================================================
   KONFIGURASI — boleh diubah sesukamu
   ========================================================= */
const CONFIG = {
  // Kalau mau pakai foto kucing sendiri, taruh di folder "foto/" lalu isi di sini,
  // contoh: ['foto/1.jpg', 'foto/2.jpg', 'foto/3.jpg']  (boleh sedikit, nanti diulang)
  fotoKucing: [],

  // isi notif (pakai bahasa kucing 🐱)
  notif: [
    { judul: 'Satu hal kecil tentang kamu',
      isi: 'meow miaw meow meow, meow miaw mrrp meow~ meow meow purr miaw meow. nyaa meow miaw meow meow 🐾' },
    { judul: 'Satu wish dari aku',
      isi: 'miaw meow meong meow, mrrp miaw meow purrr~ 🌷' },
    { judul: 'Satu alasan kamu harus disemangatin',
      isi: 'meow meow miaw meow meow, meong meow mrrp meow miaw meow. meow miaw meow meow nyaa~ meow meow miaw purr meow. MEOW meow miaw meow meow meow 🤍' },
  ],

  kalimatTerakhir: 'kamu hebat, dan aku bangga banget sama kamu. i love you, Queeninta 🤍',

  captionFoto: ['meow! 🐾', 'miaw~ semangat', 'mrrp 💕', 'meong meong!', 'purr purr 🤍', 'nyaa~ 🌷', 'meow (artinya sayang)'],
};

/* ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ================== SOUND (WebAudio, tanpa file) ================== */
const Sound = {
  ctx: null, on: true,
  init() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  ok() { return this.ctx && this.on; },
  tone(freq, start, dur, type = 'sine', vol = .12, freqEnd) {
    const c = this.ctx, t = c.currentTime + start;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + .015);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05);
  },
  noise(start, dur, vol = .2, fFrom = 3000, fTo = 300) {
    const c = this.ctx, t = c.currentTime + start;
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(fFrom, t); f.frequency.exponentialRampToValueAtTime(fTo, t + dur);
    const g = c.createGain(); g.gain.value = vol;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  },
  pop() { if (!this.ok()) return; this.tone(600, 0, .12, 'sine', .15, 1400); },
  ding() { if (!this.ok()) return; this.tone(1318, 0, .5, 'sine', .08); this.tone(1760, .07, .6, 'sine', .06); },
  chime() { if (!this.ok()) return; [523, 659, 784, 1046].forEach((f, i) => this.tone(f, i * .09, .7, 'triangle', .07)); },
  rattle() { if (!this.ok()) return; for (let i = 0; i < 6; i++) this.noise(i * .11, .06, .12, 2000, 500); },
  boom() { if (!this.ok()) return; this.noise(0, .7, .35, 4000, 120); this.tone(160, 0, .5, 'sine', .25, 50); this.chime(); },
  scratch() { if (!this.ok()) return; this.noise(0, .14, .14, 6000, 1500); },
  mew() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime, b = rand(520, 680);
    const o = c.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(b * 1.15, t);
    o.frequency.linearRampToValueAtTime(b * 1.7, t + .13);
    o.frequency.exponentialRampToValueAtTime(b * .85, t + .5);
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 3.5;
    f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(2300, t + .15); f.frequency.linearRampToValueAtTime(1100, t + .5);
    const g = c.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.22, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + .55);
    o.connect(f).connect(g).connect(c.destination); o.start(t); o.stop(t + .6);
  },
};
$('#sound').addEventListener('click', e => {
  e.stopPropagation(); Sound.init(); Sound.on = !Sound.on;
  e.currentTarget.textContent = Sound.on ? '🔊' : '🔇';
});
addEventListener('pointerdown', () => Sound.init(), { once: true });

/* ================== FLOWER GENERATOR (SVG) ================== */
const PAL = {
  pink:   ['#fbd3e0', '#f4a7c2', '#e2729a'],
  rose:   ['#ff9db1', '#ea5476', '#b8264b'],
  red:    ['#f2606f', '#cf2a45', '#8f1229'],
  white:  ['#ffffff', '#fdeef3', '#efc9d6'],
  peach:  ['#ffe2cc', '#ffbf98', '#f2936a'],
  blue:   ['#d6e4fc', '#a3c0f2', '#6f92e0'],
  lilac:  ['#efe1ff', '#cdb2f3', '#9f7fdb'],
  yellow: ['#fff2b0', '#ffd450', '#f2a614'],
};
const petalPath = (r, w, round) => round
  ? `M0 0C${w} ${-r * .15} ${w * 1.05} ${-r * .95} 0 ${-r}C${-w * 1.05} ${-r * .95} ${-w} ${-r * .15} 0 0Z`
  : `M0 0C${w} ${-r * .25} ${w * .9} ${-r * .8} 0 ${-r}C${-w * .9} ${-r * .8} ${-w} ${-r * .25} 0 0Z`;
function ring(n, r, w, fill, rot = 0, round = false, stroke = 'none', sw = .6) {
  const d = petalPath(r, w, round); let s = '';
  for (let i = 0; i < n; i++) s += `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" transform="rotate(${(rot + i * 360 / n).toFixed(1)})"/>`;
  return s;
}
function leaves() {
  if (Math.random() < .4) return '';
  const n = Math.random() < .5 ? 1 : 2, base = rand(0, 360); let s = '';
  for (let i = 0; i < n; i++) {
    const a = base + i * rand(70, 140), c = pick(['#5f9e5a', '#4c8a4f', '#76b06a']);
    s += `<g transform="rotate(${a.toFixed(0)})"><path d="M0 -20C16 -32 16 -50 0 -64C-16 -50 -16 -32 0 -20Z" fill="${c}"/><path d="M0 -22V-60" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/></g>`;
  }
  return s;
}
const FLOWERS = {
  daisy(p) {
    return ring(16, 46, 7.5, p[0], 0, false, p[2], .7) + ring(16, 38, 6, p[1], 11.25, false) +
      `<circle r="12" fill="#ffc93c"/><circle r="12" fill="none" stroke="#f29e0c" stroke-width="3" stroke-dasharray="1.5 2.5"/><circle r="5" cx="-3" cy="-3" fill="#ffe27a"/>`;
  },
  sunflower() {
    return ring(20, 48, 8, '#f2a614', 0) + ring(20, 43, 7, '#ffcf3d', 9) +
      `<circle r="21" fill="#5a3311"/><circle r="16" fill="none" stroke="#8a5420" stroke-width="5" stroke-dasharray="2 3"/><circle r="8" fill="#3d2009"/><circle r="22" fill="none" stroke="#3d2009" stroke-width="1"/>`;
  },
  rose(p) {
    const cols = [p[0], p[1], p[1], p[2], p[2]]; let s = '';
    for (let k = 0; k < 5; k++) { const R = 47 - k * 8.6; s += ring(5 + (k % 2), R, R * .62, cols[k], k * 31, true, 'rgba(80,0,20,.12)', .8); }
    return s + `<path d="M0 0c4-2 5 3 1 5-5 2-8-4-4-8 6-5 13 1 11 7" fill="none" stroke="${p[2]}" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
  },
  dahlia(p) {
    const cols = [p[2], p[1], p[1], p[0], p[0]]; let s = '';
    for (let k = 0; k < 5; k++) { const R = 47 - k * 7.8; s += ring(14, R, R * .2 + 2, cols[k], k * 12.8, false, 'rgba(80,0,30,.15)', .5); }
    return s + `<circle r="6" fill="#f3c04a"/>`;
  },
  hydrangea(p) {
    let s = '';
    for (let i = 13; i >= 0; i--) {
      const r = 11.5 * Math.sqrt(i), a = i * 137.5 * Math.PI / 180, x = Math.cos(a) * r, y = Math.sin(a) * r;
      const c = i % 3 === 0 ? p[0] : p[1];
      s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(i * 23) % 90})">${ring(4, 12, 8, c, 0, true, p[2], .6)}<circle r="2" fill="${p[2]}"/></g>`;
    }
    return s;
  },
  cosmos(p) {
    return ring(8, 46, 19, p[1], 0, true, p[2], .7) + ring(8, 36, 13, p[0], 0, true) +
      `<circle r="10" fill="#f3c04a"/><circle r="10" fill="none" stroke="#c48a10" stroke-width="2.5" stroke-dasharray="1.5 2"/>`;
  },
};
const FLOWER_TYPES = [
  ['rose', ['rose', 'red', 'pink', 'peach', 'white'], 5],
  ['daisy', ['white', 'pink', 'lilac', 'white'], 4],
  ['sunflower', [null], 2],
  ['dahlia', ['red', 'pink', 'peach', 'lilac', 'yellow'], 3],
  ['hydrangea', ['blue', 'lilac', 'pink', 'blue'], 3],
  ['cosmos', ['pink', 'white', 'peach', 'lilac'], 3],
];
const FLOWER_BAG = FLOWER_TYPES.flatMap(t => Array(t[2]).fill(t));
function flowerSVG(withLeaves = true) {
  const [type, pals] = pick(FLOWER_BAG), p = PAL[pick(pals)] || null;
  return `<svg viewBox="-66 -66 132 132">${withLeaves ? leaves() : ''}${FLOWERS[type](p)}</svg>`;
}

/* ================== FX CANVAS (confetti, hati, bintang) ================== */
const FX = (() => {
  const cv = $('#fx'), ctx = cv.getContext('2d'); let W, H; const P = []; let running = false;
  function resize() { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
  resize(); addEventListener('resize', resize);
  function heart(s) { ctx.beginPath(); ctx.moveTo(0, -s * .2); ctx.bezierCurveTo(0, -s * .5, -s * .5, -s * .5, -s * .5, -s * .2); ctx.bezierCurveTo(-s * .5, s * .1, 0, s * .25, 0, s * .5); ctx.bezierCurveTo(0, s * .25, s * .5, s * .1, s * .5, -s * .2); ctx.bezierCurveTo(s * .5, -s * .5, 0, -s * .5, 0, -s * .2); ctx.fill(); }
  function star(s) { ctx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * .18 : s * .5, a = i * Math.PI / 4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      if (p.life <= 0 || p.y > H + 60) { P.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = Math.min(1, p.life / p.fade); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      if (p.shape === 'rect') { ctx.scale(1, Math.cos(p.life * .15)); ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
      else if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 7); ctx.fill(); }
      else if (p.shape === 'heart') heart(p.s);
      else star(p.s);
      ctx.restore();
    }
    if (P.length) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, W, H); }
  }
  function add(p) { P.push(p); if (!running) { running = true; requestAnimationFrame(loop); } }
  const COLS = ['#ff9fbf', '#ff5f8f', '#ffd27a', '#fff', '#ffc2d6', '#e2557f', '#c9b3ff'];
  return {
    burst(x, y, o = {}) {
      const n = o.n || 80;
      for (let i = 0; i < n; i++) {
        const a = o.up ? rand(-Math.PI * .95, -Math.PI * .05) : rand(0, Math.PI * 2), sp = rand(o.min || 3, o.max || 14);
        add({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.g ?? .22, drag: o.drag || .975, rot: rand(0, 6), vr: rand(-.2, .2),
          s: rand(o.smin || 6, o.smax || 14), c: pick(o.colors || COLS), shape: pick(o.shapes || ['rect', 'circle', 'heart', 'star']),
          life: rand(60, o.life || 140), fade: 30 });
      }
    },
    hearts(x, y, n = 8) { this.burst(x, y, { n, shapes: ['heart'], min: 1.5, max: 5, g: -.04, drag: .96, smin: 10, smax: 20, life: 80, colors: ['#ff5f8f', '#ff9fbf', '#ffc2d6', '#e2557f'] }); },
    rain(n = 120) {
      for (let i = 0; i < n; i++) add({ x: rand(0, W), y: rand(-H * .6, -10), vx: rand(-1, 1), vy: rand(2, 5), g: .04, drag: .995, rot: rand(0, 6), vr: rand(-.08, .08),
        s: rand(12, 26), c: pick(['#ff5f8f', '#ff9fbf', '#ffc2d6', '#e2557f', '#fff']), shape: 'heart', life: 400, fade: 40 });
    },
  };
})();

/* ================== kelopak jatuh di background ================== */
(() => {
  const cv = $('#petals'), ctx = cv.getContext('2d'); let W, H; const ps = [];
  function resize() { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
  resize(); addEventListener('resize', resize);
  const N = innerWidth < 600 ? 16 : 26;
  for (let i = 0; i < N; i++) ps.push({ x: rand(0, W), y: rand(-H, H), s: rand(6, 13), v: rand(.4, 1.1), a: rand(0, 6), va: rand(-.02, .02), sw: rand(0, 6), c: pick(['255,159,191', '255,194,214', '255,220,230', '226,85,127']) });
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.y += p.v; p.sw += .02; p.x += Math.sin(p.sw) * .5; p.a += p.va;
      if (p.y > H + 20) { p.y = -20; p.x = rand(0, W); }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = `rgba(${p.c},.55)`;
      ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, 7); ctx.fill(); ctx.restore();
    }
    requestAnimationFrame(loop);
  })();
})();

/* ================== SCENE MANAGER ================== */
let current = 'loading';
const enter = {};
function go(name) {
  const from = $('#s-' + current), to = $('#s-' + name);
  if (!to || name === current) return;
  from.classList.remove('active'); to.classList.add('active'); current = name;
  if (enter[name]) setTimeout(() => enter[name](), 350);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-next]');
  if (b) { Sound.pop(); go(b.dataset.next); }
});
// tap di mana aja = hati kecil (kecuali di scene meow & loading)
document.addEventListener('pointerdown', e => {
  if (['loading', 'meow'].includes(current)) return;
  if (e.target.closest('button,.tile,.notif,.modal,.lightbox,#letter')) return;
  FX.hearts(e.clientX, e.clientY, 7);
});

/* ================== 1. LOADING + GELOMBANG BUNGA ================== */
(() => { // bunga loading
  $('.r1').innerHTML = ring(8, 50, 22, '#ffc2d6', 0, true, '#e2729a', .8);
  $('.r2').innerHTML = ring(7, 38, 17, '#ff8fb1', 25, true, '#c23463', .8);
  $('.r3').innerHTML = ring(6, 26, 12, '#e2557f', 10, true, '#9e1f45', .8);
})();

let waveItems = [];
function prepareWave() {
  const wave = $('#wave'), W = innerWidth, H = innerHeight;
  const base = clamp(Math.min(W, H) / 3.6, 85, 200), step = base * .58;
  const frag = document.createDocumentFragment(); waveItems = [];
  for (let y = -base * .3; y < H + base * .3; y += step) {
    for (let x = -base * .3; x < W + base * .3; x += step) {
      const s = base * rand(.95, 1.45), px = x + rand(-.35, .35) * step, py = y + rand(-.35, .35) * step;
      const el = document.createElement('div'); el.className = 'wf';
      el.style.cssText = `width:${s}px;height:${s}px;left:${px - s / 2}px;top:${py - s / 2}px;z-index:${Math.floor(rand(0, 100))};transform:translate(${W + base * 2}px,${H + base * 2}px)`;
      el.innerHTML = flowerSVG();
      frag.appendChild(el); waveItems.push(el);
    }
  }
  wave.innerHTML = ''; wave.appendChild(frag); wave.style.display = 'block';
}
function playWave(onCover) {
  const W = innerWidth, H = innerHeight, dx = W + 260, dy = H + 260;
  const IN = 1000, HOLD = 1200, OUT = 950, T = IN + HOLD + OUT;
  waveItems.forEach(el => {
    const r0 = rand(-120, 120), r1 = rand(-15, 15), jit = rand(0, 220);
    el.animate([
      { transform: `translate(${dx}px,${dy}px) rotate(${r0}deg) scale(.6)`, offset: 0, easing: 'cubic-bezier(.15,.75,.3,1)' },
      { transform: 'translate(0,0) rotate(0deg) scale(1)', offset: IN / T, easing: 'ease-in-out' },
      { transform: `translate(0,0) rotate(${r1}deg) scale(1.07)`, offset: (IN + HOLD) / T, easing: 'cubic-bezier(.6,0,.85,.4)' },
      { transform: `translate(${-dx}px,${-dy}px) rotate(${-r0}deg) scale(.6)`, offset: 1 },
    ], { duration: T, delay: jit, fill: 'both' });
  });
  setTimeout(onCover, IN + 250);
  setTimeout(() => { const w = $('#wave'); w.style.display = 'none'; w.innerHTML = ''; waveItems = []; }, T + 400);
}
async function runLoading() {
  prepareWave();
  const pct = $('#pct'), fill = $('#bar-fill'), sc = $('#s-loading'), T = 3000, t0 = performance.now();
  await new Promise(res => {
    (function f(now) {
      const t = Math.min(1, (now - t0) / T), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const v = Math.round(1 + e * 99);
      pct.textContent = v + '%'; fill.style.width = v + '%'; sc.style.setProperty('--p', e.toFixed(3));
      t < 1 ? requestAnimationFrame(f) : res();
    })(t0);
  });
  await sleep(200);
  playWave(() => go('gift'));
}

/* ================== 2. KADO ================== */
let giftOpened = false;
$('#gift').addEventListener('click', async () => {
  if (giftOpened) return; giftOpened = true;
  const g = $('#gift'); $('#gift-hint').classList.add('hide');
  g.classList.add('shake'); Sound.rattle();
  await sleep(750);
  g.classList.remove('shake'); g.classList.add('open');
  const r = g.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .35;
  // flash + gelombang kejut
  const fl = $('#flash'); fl.style.setProperty('--fx', cx + 'px'); fl.style.setProperty('--fy', cy + 'px');
  fl.animate([{ opacity: 0 }, { opacity: .95, offset: .15 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
  for (let i = 0; i < 2; i++) {
    const s = document.createElement('div'); s.className = 'shock'; s.style.left = cx + 'px'; s.style.top = cy + 'px';
    document.body.appendChild(s);
    s.animate([{ transform: 'scale(.2)', opacity: 1 }, { transform: `scale(${22 + i * 10})`, opacity: 0 }], { duration: 900 + i * 300, delay: i * 120, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'both' }).onfinish = () => s.remove();
  }
  Sound.boom();
  FX.burst(cx, cy, { n: 160, up: true, min: 5, max: 19 });
  setTimeout(() => FX.burst(cx, cy, { n: 60, shapes: ['star', 'heart'], min: 2, max: 9, g: .05 }), 200);
  explodeFlowers(cx, cy);
  buildBouquet();
  await sleep(2000);
  $('#gift-after').classList.add('show'); Sound.chime();
});
function explodeFlowers(cx, cy) {
  const layer = $('#burst-layer'), D = Math.max(innerWidth, innerHeight);
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div'), s = rand(50, 95);
    el.className = 'bf'; el.innerHTML = flowerSVG(false);
    el.style.cssText = `width:${s}px;height:${s}px;left:${cx - s / 2}px;top:${cy - s / 2}px`;
    layer.appendChild(el);
    const a = rand(-Math.PI, 0) + rand(-.4, .4), d = rand(.35, .75) * D;
    el.animate([
      { transform: 'translate(0,0) scale(.2) rotate(0)', opacity: 1 },
      { transform: `translate(${Math.cos(a) * d * .7}px,${Math.sin(a) * d * .7}px) scale(1.15) rotate(${rand(-300, 300)}deg)`, opacity: 1, offset: .6 },
      { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 120}px) scale(.9) rotate(${rand(-500, 500)}deg)`, opacity: 0 },
    ], { duration: rand(1300, 1900), easing: 'cubic-bezier(.1,.75,.3,1)', fill: 'forwards' }).onfinish = () => el.remove();
  }
}
function buildBouquet() {
  const bq = $('#bouquet'), stage = $('#gift-stage'), u = clamp(stage.clientHeight / 440, .6, 1.1);
  bq.style.bottom = (28 + 118 * 1) + 'px';
  const pts = []; let tries = 0;
  while (pts.length < 26 && tries < 900) {
    tries++;
    const a = rand(-Math.PI * .97, -Math.PI * .03), rr = Math.sqrt(Math.random()) * 175 * u;
    const x = Math.cos(a) * rr * 1.1, y = Math.sin(a) * rr - 8 * u, s = rand(62, 96) * u * (1 - rr / (175 * u) * .25);
    if (y > 0) continue;
    if (pts.some(p => Math.hypot(p.x - x, p.y - y) < (p.s + s) * .3)) continue;
    pts.push({ x, y, s });
  }
  pts.sort((a, b) => a.y - b.y);
  pts.forEach((p, i) => {
    const el = document.createElement('div'); el.className = 'bq'; el.innerHTML = flowerSVG();
    el.style.cssText = `width:${p.s}px;height:${p.s}px;left:${-p.s / 2}px;top:${-p.s / 2}px;z-index:${i}`;
    bq.appendChild(el);
    const rot = rand(-25, 25);
    el.animate([
      { transform: `translate(0,${10 * u}px) scale(.1) rotate(${rot - 90}deg)`, opacity: 0 },
      { transform: `translate(${p.x}px,${p.y}px) scale(1) rotate(${rot}deg)`, opacity: 1 },
    ], { duration: 950, delay: 80 + i * 40, easing: 'cubic-bezier(.18,1.45,.4,1)', fill: 'both' }).onfinish = () => {
      el.animate([{ transform: `translate(${p.x}px,${p.y}px) scale(1) rotate(${rot}deg)` }, { transform: `translate(${p.x}px,${p.y - 4}px) scale(1.03) rotate(${rot + rand(-4, 4)}deg)` }],
        { duration: rand(1800, 2600), direction: 'alternate', iterations: Infinity, easing: 'ease-in-out', fill: 'both' });
    };
  });
}

/* ================== 3. MEOW + CAKARAN ================== */
let scratchCount = 0;
enter.meow = async () => {
  const spans = $$('#meow-text span');
  for (const s of spans) { s.classList.add('in'); Sound.mew(); await sleep(520); }
};
const CLAW = `<svg viewBox="0 0 120 120" class="claw-svg" style="width:100%;height:100%;overflow:visible">
  <path class="c1" pathLength="1" d="M28 14Q16 60 30 106"/><path class="c1" pathLength="1" d="M58 8Q46 60 60 112"/><path class="c1" pathLength="1" d="M88 14Q76 60 90 106"/>
  <path class="c2" pathLength="1" d="M26 26Q19 55 25 80"/><path class="c2" pathLength="1" d="M56 20Q49 55 55 86"/><path class="c2" pathLength="1" d="M86 26Q79 55 85 80"/></svg>`;
const PAW = `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M50 52c14 0 28 14 28 28 0 10-8 14-16 12-6-1-8-4-12-4s-6 3-12 4c-8 2-16-2-16-12 0-14 14-28 28-28z" fill="#ff9fbf"/><ellipse cx="22" cy="44" rx="9" ry="12" fill="#ff9fbf" transform="rotate(-20 22 44)"/><ellipse cx="40" cy="24" rx="9" ry="12" fill="#ff9fbf" transform="rotate(-6 40 24)"/><ellipse cx="60" cy="24" rx="9" ry="12" fill="#ff9fbf" transform="rotate(6 60 24)"/><ellipse cx="78" cy="44" rx="9" ry="12" fill="#ff9fbf" transform="rotate(20 78 44)"/></svg>`;
function addClaw(x, y) {
  const layer = $('#scratch-layer'), s = rand(110, 160);
  const el = document.createElement('div'); el.className = 'claw';
  el.style.cssText = `left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px;transform:rotate(${rand(-35, 35)}deg)`;
  el.innerHTML = CLAW;
  for (let i = 0; i < 3; i++) {
    const sp = document.createElement('span'); sp.className = 'spark'; sp.textContent = pick(['✦', '✧', '♥']);
    sp.style.left = rand(0, 100) + '%'; sp.style.top = rand(0, 100) + '%'; sp.style.animationDelay = rand(.1, .4) + 's';
    el.appendChild(sp);
  }
  layer.appendChild(el);
  const all = $$('.claw', layer);
  if (all.length > 10) { all[0].classList.add('fade'); setTimeout(() => all[0].remove(), 1200); }
  Sound.scratch(); if (Math.random() < .5) setTimeout(() => Sound.mew(), 150);
  if (navigator.vibrate) navigator.vibrate(25);
  scratchCount++;
  const sc = $('#scratch-count');
  sc.textContent = `cakaran ke-${scratchCount} 🐾`; sc.classList.add('bump'); setTimeout(() => sc.classList.remove('bump'), 200);
  if (scratchCount === 1) $('#meow-hint').textContent = 'lagi lagi, tahan terus & geser jarinya 🐾';
  if (scratchCount >= 4) { $('#meow-after').classList.add('show'); }
}
function addPaw(x, y, ang) {
  const el = document.createElement('div'); el.className = 'paw';
  el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.setProperty('--r', `rotate(${ang + 90}deg)`);
  el.innerHTML = PAW; $('#scratch-layer').appendChild(el); setTimeout(() => el.remove(), 1900);
}
(() => {
  const sc = $('#s-meow'); let down = false, px = 0, py = 0, lx = 0, ly = 0, holdT, intT, ring;
  sc.addEventListener('contextmenu', e => e.preventDefault());
  sc.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    down = true; px = lx = e.clientX; py = ly = e.clientY;
    ring = document.createElement('div'); ring.className = 'hold-ring'; ring.style.left = px + 'px'; ring.style.top = py + 'px';
    $('#scratch-layer').appendChild(ring);
    $('#cat-peek').classList.add('excited');
    holdT = setTimeout(() => { addClaw(px, py); intT = setInterval(() => addClaw(px + rand(-30, 30), py + rand(-30, 30)), 650); }, 220);
  });
  sc.addEventListener('pointermove', e => {
    if (!down) return; px = e.clientX; py = e.clientY;
    if (ring) { ring.style.left = px + 'px'; ring.style.top = py + 'px'; }
    const d = Math.hypot(px - lx, py - ly);
    if (d > 42) { addPaw(px, py, Math.atan2(py - ly, px - lx) * 180 / Math.PI); lx = px; ly = py; }
  });
  const up = () => { down = false; clearTimeout(holdT); clearInterval(intT); if (ring) ring.remove(); ring = null; $('#cat-peek').classList.remove('excited'); };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => sc.addEventListener(ev, up));
})();

/* ================== 4. SURAT ================== */
let letterOpened = false;
$('#letter').addEventListener('click', async () => {
  if (letterOpened) return; letterOpened = true;
  const L = $('#letter'), seal = $('#seal'), sr = seal.getBoundingClientRect();
  L.classList.add('opened'); $('#letter-hint').classList.add('hide');
  seal.classList.add('pop'); Sound.pop(); FX.hearts(sr.left + sr.width / 2, sr.top + sr.height / 2, 12);
  await sleep(550);
  const paper = $('#paper'), inner = paper.firstElementChild, full = inner.scrollHeight;
  const kids = [...inner.children], scene = $('#s-letter'), rollB = $('#roll-bottom');
  const dur = clamp(full * 5, 4000, 7500), t0 = performance.now();
  let userScroll = false; const stopFollow = () => userScroll = true;
  scene.addEventListener('wheel', stopFollow, { once: true }); scene.addEventListener('touchstart', stopFollow, { once: true });
  Sound.chime();
  await new Promise(res => {
    (function f(now) {
      const t = Math.min(1, (now - t0) / dur), e = -(Math.cos(Math.PI * t) - 1) / 2, h = full * e;
      paper.style.height = h + 'px';
      kids.forEach(k => { if (!k.classList.contains('in') && k.offsetTop + 24 < h) k.classList.add('in'); });
      if (!userScroll) {
        const rb = rollB.getBoundingClientRect(), lim = innerHeight - 40;
        if (rb.bottom > lim) scene.scrollTop += rb.bottom - lim;
      }
      t < 1 ? requestAnimationFrame(f) : res();
    })(t0);
  });
  paper.style.height = 'auto'; kids.forEach(k => k.classList.add('in'));
  await sleep(600);
  $('#letter-after').classList.add('show');
  if (!userScroll) setTimeout(() => scene.scrollBy({ top: 200, behavior: 'smooth' }), 200);
});

/* ================== 5. LOVE DARI FOTO KUCING ================== */
function catSVG(i) {
  const furs = [['#f6c89f', '#e9a96f'], ['#e2e2e2', '#bdbdbd'], ['#4a4a4a', '#2c2c2c'], ['#fff6ec', '#f0dcc6'], ['#c98d5a', '#a86c3d']];
  const bgs = ['#ffe4ec', '#e6eeff', '#fff2d2', '#e6fbea', '#f1e6ff'];
  const [f, f2] = furs[i % furs.length], bg = bgs[(i * 3) % bgs.length], eye = f === '#4a4a4a' ? '#ffd34d' : '#2b1b14';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'><rect width='300' height='400' fill='${bg}'/>
<ellipse cx='150' cy='410' rx='125' ry='90' fill='${f}'/><g transform='translate(150 220)'>
<path d='M-95 -30L-82 -140L-22 -80Z' fill='${f2}'/><path d='M95 -30L82 -140L22 -80Z' fill='${f2}'/>
<path d='M-78 -50L-72 -115L-38 -80Z' fill='#ffb3c7'/><path d='M78 -50L72 -115L38 -80Z' fill='#ffb3c7'/>
<ellipse rx='112' ry='96' fill='${f}'/>
<ellipse cx='-40' cy='-4' rx='17' ry='21' fill='${eye}'/><ellipse cx='40' cy='-4' rx='17' ry='21' fill='${eye}'/>
<ellipse cx='-40' cy='-4' rx='7' ry='15' fill='#1a0f0b'/><ellipse cx='40' cy='-4' rx='7' ry='15' fill='#1a0f0b'/>
<circle cx='-33' cy='-13' r='6' fill='#fff'/><circle cx='47' cy='-13' r='6' fill='#fff'/>
<path d='M-9 22h18l-9 10z' fill='#ff8fab'/>
<path d='M0 32q-10 13-20 5M0 32q10 13 20 5' stroke='#5a3a2e' stroke-width='3.5' fill='none' stroke-linecap='round'/>
<ellipse cx='-70' cy='28' rx='17' ry='9' fill='#ff9fbf' opacity='.55'/><ellipse cx='70' cy='28' rx='17' ry='9' fill='#ff9fbf' opacity='.55'/>
<path d='M-60 18l-45-8M-60 28l-45 4M60 18l45-8M60 28l45 4' stroke='#8a6a5a' stroke-width='2.2' stroke-linecap='round' opacity='.6'/></g></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
// titik-titik bentuk hati (pola bata)
const HEART_C = 9, HEART_R = 8;
const heartCells = (() => {
  const out = [];
  for (let r = 0; r < HEART_R; r++) {
    const off = r % 2 ? .5 : 0;
    for (let c = 0; c < HEART_C + (off ? -1 : 0); c++) {
      const cx = (c + .5 + off) / HEART_C, cy = (r + .5) / HEART_R;
      const x = (cx * 2 - 1) * 1.22, y = 1.08 - cy * 2.3;
      const v = Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y;
      if (v <= .02) out.push({ cx, cy, r });
    }
  }
  return out;
})();
const tiles = heartCells.map((cell, i) => {
  const t = document.createElement('div'); t.className = 'tile';
  const img = new Image(); img.alt = 'kucing lucu'; img.decoding = 'async';
  const fallback = () => { if (!img.dataset.fb) { img.dataset.fb = 1; img.src = catSVG(i); } };
  img.onerror = fallback;
  img.src = CONFIG.fotoKucing.length ? CONFIG.fotoKucing[i % CONFIG.fotoKucing.length] : `https://cataas.com/cat?width=300&height=400&n=${i}-${Date.now() % 100000}`;
  setTimeout(() => { if (!img.complete || !img.naturalWidth) fallback(); }, 12000);
  t.appendChild(img); t.addEventListener('click', e => openLightbox(img.src, t));
  return { t, cell, rot: rand(-8, 8) };
});
enter.heart = async () => {
  const grid = $('#heart-grid');
  const w = Math.min(innerWidth * .94 / HEART_C, innerHeight * .56 / (HEART_R * 1.25), 70), h = w * 1.25;
  grid.style.width = (w * HEART_C) + 'px'; grid.style.height = (h * HEART_R) + 'px';
  const tw = w * 1.16, th = h * 1.12, cx0 = w * HEART_C / 2, cy0 = h * HEART_R / 2;
  const order = tiles.map((o, i) => i).sort(() => Math.random() - .5);
  tiles.forEach(o => {
    o.t.style.cssText = `width:${tw}px;height:${th}px;left:${o.cell.cx * w * HEART_C - tw / 2}px;top:${o.cell.cy * h * HEART_R - th / 2}px;z-index:${Math.floor(rand(1, 100))}`;
    grid.appendChild(o.t);
  });
  order.forEach((idx, k) => {
    const o = tiles[idx], tx = o.cell.cx * w * HEART_C, ty = o.cell.cy * h * HEART_R;
    o.t.animate([
      { transform: `translate(${(cx0 - tx) + rand(-200, 200)}px,${(cy0 - ty) + rand(250, 500)}px) rotate(${rand(-180, 180)}deg) scale(.2)`, opacity: 0 },
      { transform: `rotate(${o.rot}deg)`, opacity: 1 },
    ], { duration: 900, delay: k * 45, easing: 'cubic-bezier(.2,1.25,.4,1)', fill: 'both' });
    if (k % 6 === 0) setTimeout(() => Sound.pop(), k * 45 + 300);
  });
  await sleep(tiles.length * 45 + 900);
  grid.classList.add('beat'); Sound.chime();
  const r = grid.getBoundingClientRect(); FX.hearts(r.left + r.width / 2, r.top + r.height / 2, 18);
  setTimeout(() => $('#heart-after').classList.add('show'), 800);
};
function openLightbox(src) {
  $('#lb-img').src = src; $('#lb-cap').textContent = pick(CONFIG.captionFoto);
  $('#lightbox').classList.add('show'); Sound.mew();
}
$('#lightbox').addEventListener('click', () => $('#lightbox').classList.remove('show'));

/* ================== 6. NOTIF ================== */
let readSet = new Set();
enter.notif = async () => {
  const now = new Date();
  $('#lock-time').textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  $('#lock-date').textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  const box = $('#notifs'); box.innerHTML = '';
  for (let i = 0; i < CONFIG.notif.length; i++) {
    const n = CONFIG.notif[i], b = document.createElement('button');
    b.className = 'notif'; b.dataset.i = i;
    b.innerHTML = `<div class="n-icon">🐱</div><div class="n-body"><div class="n-top"><b>MEOWSSAGE</b><span>sekarang</span></div><div class="n-title">${n.judul}</div><div class="n-text">${n.isi}</div></div>`;
    b.addEventListener('click', () => openNotif(b, i));
    box.appendChild(b);
    await sleep(i === 0 ? 300 : 750);
    b.classList.add('in'); Sound.ding(); if (navigator.vibrate) navigator.vibrate(30);
  }
};
let modalFrom = null;
function flipFrom(card, el) {
  const a = el.getBoundingClientRect(), c = card.getBoundingClientRect();
  return `translate(${a.left - c.left}px,${a.top - c.top}px) scale(${a.width / c.width},${a.height / c.height})`;
}
function openNotif(el, i) {
  const m = $('#modal'), card = $('#modal-card'), n = CONFIG.notif[i];
  $('#m-label').textContent = n.judul; $('#m-text').textContent = n.isi;
  modalFrom = el; m.classList.add('show'); card.classList.remove('ready');
  card.animate([{ transform: flipFrom(card, el), borderRadius: '40px' }, { transform: 'none', borderRadius: '24px' }],
    { duration: 520, easing: 'cubic-bezier(.2,.85,.25,1)' }).onfinish = () => card.classList.add('ready');
  Sound.pop(); setTimeout(() => Sound.mew(), 300);
  el.classList.add('read'); readSet.add(i);
}
function closeNotif() {
  const m = $('#modal'), card = $('#modal-card');
  card.classList.remove('ready');
  card.animate([{ transform: 'none', opacity: 1 }, { transform: flipFrom(card, modalFrom), opacity: .3 }], { duration: 380, easing: 'cubic-bezier(.4,0,.6,1)' })
    .onfinish = () => {
      m.classList.remove('show');
      if (readSet.size >= CONFIG.notif.length) { $('#notif-hint').classList.add('hide'); $('#notif-after').classList.add('show'); Sound.chime(); }
    };
}
$('#m-close').addEventListener('click', closeNotif);
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeNotif(); });

/* ================== 7. TERAKHIR ================== */
enter.final = async () => {
  const el = $('#final-text'), txt = CONFIG.kalimatTerakhir; el.innerHTML = '<span class="cur"></span>';
  FX.rain(70);
  const hr = $('#big-heart').getBoundingClientRect(); FX.hearts(hr.left + hr.width / 2, hr.top + hr.height / 2, 24);
  await sleep(600);
  const chars = [...txt];
  for (let i = 1; i <= chars.length; i++) { el.innerHTML = chars.slice(0, i).join('') + '<span class="cur"></span>'; await sleep(chars[i - 1] === ',' || chars[i - 1] === '.' ? 280 : 55); }
};
$('#big-heart').addEventListener('click', e => { FX.hearts(e.clientX, e.clientY, 20); Sound.pop(); });
(() => {
  const hug = $('#hug'), ring = $('#hug-ring'), lab = $('#hug-label'); let anim = null, done = false;
  const start = e => {
    e.preventDefault(); if (anim) return; hug.classList.add('holding');
    anim = ring.animate([{ strokeDashoffset: getComputedStyle(ring).strokeDashoffset }, { strokeDashoffset: 0 }], { duration: 1600, fill: 'forwards', easing: 'linear' });
    anim.onfinish = () => {
      done = true; hug.classList.remove('holding'); lab.textContent = 'peluk diterima 🤍 *peluk erat*';
      FX.rain(160); const r = hug.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 90 }); Sound.boom();
      if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
      setTimeout(() => { ring.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: 1 }], { duration: 600, fill: 'forwards' }); lab.textContent = 'peluk lagi? 🫂'; anim = null; }, 2600);
    };
  };
  const stop = () => {
    hug.classList.remove('holding');
    if (anim && anim.playState === 'running') { anim.cancel(); anim = null; ring.style.strokeDashoffset = 1; }
  };
  hug.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => hug.addEventListener(ev, stop));
  hug.addEventListener('contextmenu', e => e.preventDefault());
})();
$('#replay').addEventListener('click', () => location.reload());

/* ================== START ================== */
// ?s=gift / meow / letter / heart / notif / final  -> loncat langsung (buat ngetes)
const jump = new URLSearchParams(location.search).get('s');
if (jump && $('#s-' + jump)) { go(jump); }
else runLoading();
