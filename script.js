import * as G from './game.mjs?v=1';
const { W, H, GROUND, DT, N_DROPS, SPRAY_TIME, NEED, BOWL_H, TANK_W, SKIN_BY, CATS, SKINS, LEVELS } = G;
const $ = id => document.getElementById(id);
let state; const cur = () => state.equipped;
function load() { try { return G.normalize(JSON.parse(localStorage.getItem(G.SAVE_KEY))); } catch { return G.initial(); } }
function save() { try { localStorage.setItem(G.SAVE_KEY, JSON.stringify(state)); } catch {} }
function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2600); }

// ============ DESSIN ============
const rnd = (a, b) => a + Math.random()*(b - a);
function skinColor(id, t, i = 0) {
  const s = SKIN_BY[id]; if (!s) return '#222';
  if (s.c === 'rainbow') return `hsl(${(t*120 + i*14) % 360} 90% 55%)`;
  return s.c;
}
function jetColor(id, t, i, age) {
  const s = SKIN_BY[id];
  if (s.c === 'rainbow') return `hsl(${(i*13 + t*60) % 360} 95% 60%)`;
  if (s.c === 'fire') return age < .25 ? '#ffe45a' : age < .5 ? '#ff9a2e' : '#ff4a2e';
  return s.c;
}
function drawFigure(c, o) {
  const {x, y, lean = 0, t = 0} = o, body = skinColor(o.corps, t), lw = 5;
  const hx = x, hy = y - 50, dx = -Math.sin(lean), dy = -Math.cos(lean);
  const neck = {x: hx + dx*40, y: hy + dy*40}, head = {x: neck.x + dx*15, y: neck.y + dy*15};
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = body; c.lineWidth = lw; c.fillStyle = body;
  // ombre au sol
  c.fillStyle = '#0003'; c.beginPath(); c.ellipse(x + 2, y + 2, 26, 5, 0, 0, 7); c.fill(); c.fillStyle = body;
  // jambes
  c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx - 6, hy + 26); c.lineTo(hx - 12 + lean*10, y); c.moveTo(hx, hy); c.lineTo(hx + 8, hy + 26); c.lineTo(hx + 14, y); c.stroke();
  // pieds
  c.beginPath(); c.moveTo(hx - 12 + lean*10, y); c.lineTo(hx - 2 + lean*10, y); c.moveTo(hx + 14, y); c.lineTo(hx + 24, y); c.stroke();
  // corps + bras
  c.beginPath(); c.moveTo(hx, hy); c.lineTo(neck.x, neck.y); c.stroke();
  const sh = {x: hx + dx*30, y: hy + dy*30};
  c.beginPath(); c.moveTo(sh.x, sh.y); c.lineTo(sh.x + 8, sh.y + 16); c.lineTo(hx + 12, hy - 2); c.moveTo(sh.x, sh.y); c.lineTo(sh.x - 10, sh.y + 14); c.lineTo(hx + 2, hy + 4); c.stroke();
  // tête
  c.fillStyle = '#fff'; c.beginPath(); c.arc(head.x, head.y, 14, 0, 7); c.fill(); c.stroke();
  c.fillStyle = body; c.beginPath(); c.arc(head.x + 6, head.y - 2, 2.4, 0, 7); c.fill();
  c.lineWidth = 2; c.beginPath(); c.arc(head.x + 5, head.y + 4, 4, .2, 2.6); c.stroke();
  // visage
  const v = o.visage;
  c.save(); c.translate(head.x, head.y); c.rotate(lean*-1);
  if (v === 'vis_lunettes') { c.fillStyle = '#111'; c.fillRect(-3, -7, 17, 7); c.fillRect(-13, -6, 12, 3); c.fillStyle = '#fff6'; c.fillRect(1, -6, 4, 2); }
  if (v === 'vis_mous') { c.strokeStyle = '#4a2a14'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(8, 2, 15, 6); c.stroke(); }
  if (v === 'vis_ninja') { c.fillStyle = '#d8333b'; c.fillRect(-15, -9, 30, 6); c.beginPath(); c.moveTo(-14, -6); c.lineTo(-28, -2); c.lineTo(-24, -10); c.lineTo(-30, -14); c.lineTo(-14, -9); c.fill(); }
  if (v === 'vis_masque') { c.fillStyle = '#7a3fd6'; c.beginPath(); c.moveTo(-14, -9); c.lineTo(15, -9); c.lineTo(12, 1); c.lineTo(3, -2); c.lineTo(-4, 1); c.lineTo(-14, 0); c.fill(); c.fillStyle = '#fff'; c.fillRect(5, -6, 5, 2); }
  // chapeau
  const h = o.chapeau, hc = SKIN_BY[h]?.c; c.lineWidth = 2; c.strokeStyle = '#0006';
  if (h === 'chap_cap') { c.fillStyle = hc; c.beginPath(); c.arc(0, -4, 14, Math.PI, 0); c.fill(); c.fillRect(0, -6, 24, 5); }
  if (h === 'chap_fete') { c.fillStyle = hc; c.beginPath(); c.moveTo(-11, -10); c.lineTo(11, -10); c.lineTo(0, -38); c.fill(); c.fillStyle = '#ffe03a'; c.beginPath(); c.arc(0, -39, 4, 0, 7); c.fill(); c.fillStyle = '#fff'; for (const [a, b] of [[-3, -18], [3, -26], [-1, -30]]) { c.beginPath(); c.arc(a, b, 1.8, 0, 7); c.fill(); } }
  if (h === 'chap_chantier') { c.fillStyle = hc; c.beginPath(); c.arc(0, -6, 15, Math.PI, 0); c.fill(); c.fillRect(-18, -7, 36, 5); c.fillStyle = '#fff6'; c.fillRect(-2, -20, 4, 8); }
  if (h === 'chap_haut') { c.fillStyle = hc; c.fillRect(-18, -12, 36, 4); c.fillRect(-11, -36, 22, 26); c.fillStyle = '#d8333b'; c.fillRect(-11, -18, 22, 5); }
  if (h === 'chap_sorcier') { c.fillStyle = hc; c.beginPath(); c.moveTo(-22, -9); c.lineTo(22, -9); c.lineTo(8, -12); c.lineTo(14, -46); c.lineTo(-10, -12); c.fill(); c.fillStyle = '#ffe03a'; c.beginPath(); c.arc(-2, -22, 3, 0, 7); c.fill(); }
  if (h === 'chap_couronne') { c.fillStyle = hc; c.beginPath(); c.moveTo(-12, -11); c.lineTo(-13, -26); c.lineTo(-6, -18); c.lineTo(0, -28); c.lineTo(6, -18); c.lineTo(13, -26); c.lineTo(12, -11); c.fill(); c.fillStyle = '#d8333b'; c.beginPath(); c.arc(0, -15, 2.4, 0, 7); c.fill(); }
  c.restore(); c.restore();
}
function drawToilet(c, T, L, skin, fill, t, flush) {
  const [c1, c2] = SKIN_BY[skin].c, top = T.y - BOWL_H, x = T.x, bw = T.bw;
  c.save();
  const grad = (x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, c1); g.addColorStop(1, c2); return g; };
  // support
  if (L.floating) { c.fillStyle = '#6b5b45'; c.fillRect(x - 8, T.y, bw + TANK_W + 16, 14); c.fillStyle = '#222'; for (const px of [x + 4, x + bw + TANK_W - 4]) { c.beginPath(); c.arc(px, T.y + 16, 6, 0, 7); c.fill(); } }
  else if (L.ty < GROUND) { const g = c.createLinearGradient(0, T.y, 0, GROUND); g.addColorStop(0, '#9a8466'); g.addColorStop(1, '#5d4c36'); c.fillStyle = g; c.fillRect(x - 8, T.y, bw + TANK_W + 16, GROUND - T.y); c.strokeStyle = '#0003'; c.lineWidth = 1; for (let yy = T.y + 14; yy < GROUND; yy += 14) { c.beginPath(); c.moveTo(x - 8, yy); c.lineTo(x + bw + TANK_W + 8, yy); c.stroke(); } }
  // réservoir
  c.fillStyle = grad(x + bw, top - 56, x + bw + TANK_W, T.y); c.strokeStyle = '#0005'; c.lineWidth = 2; rr(c, x + bw - 2, top - 56, TANK_W + 2, BOWL_H + 56, 6); c.fill(); c.stroke();
  c.fillStyle = '#0002'; c.fillRect(x + bw - 2, top - 56, TANK_W + 2, 8); c.fillStyle = '#fff8'; c.fillRect(x + bw + 6, top - 40, 4, 30);
  // cuvette
  const path = () => { c.beginPath(); c.moveTo(x, top); c.lineTo(x + bw, top); c.lineTo(x + bw, top + BOWL_H*.55); c.quadraticCurveTo(x + bw, T.y, x + bw*.55, T.y); c.lineTo(x + bw*.25, T.y); c.quadraticCurveTo(x, T.y - 4, x, top + BOWL_H*.4); c.closePath(); };
  path(); c.fillStyle = grad(x, top, x + bw, T.y); c.fill(); c.stroke();
  // eau
  c.save(); path(); c.clip();
  const wl = T.y - 6 - Math.min(1, fill)*(BOWL_H - 14); const wg = c.createLinearGradient(0, wl, 0, T.y); wg.addColorStop(0, '#7fd8ffcc'); wg.addColorStop(1, '#3a9fe0cc'); c.fillStyle = wg;
  c.beginPath(); c.moveTo(x - 4, wl + Math.sin(t*5)*1.2); for (let xx = x - 4; xx <= x + bw + 4; xx += 6) c.lineTo(xx, wl + Math.sin(t*5 + xx*.2)*1.6); c.lineTo(x + bw + 4, T.y + 4); c.lineTo(x - 4, T.y + 4); c.fill();
  if (flush) { c.strokeStyle = '#fff9'; c.lineWidth = 3; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + bw/2, T.y - 14, 6 + k*8, t*8 + k, t*8 + k + 4); c.stroke(); } }
  c.restore();
  // rebords
  c.strokeStyle = '#0005'; c.lineWidth = 2; c.fillStyle = c1; rr(c, x - 3, top - 3, bw + 6, 7, 3); c.fill(); c.stroke();
  c.fillStyle = '#fff7'; c.fillRect(x + 2, top - 2, bw - 4, 2);
  if (SKIN_BY[skin].id === 'toi_diamant') { c.fillStyle = '#fff'; const s = (Math.sin(t*4)+1)/2; c.globalAlpha = .4 + .6*s; star(c, x + bw*.3, top + 14, 6); star(c, x + bw + 18, top - 30, 5); c.globalAlpha = 1; }
  c.restore();
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function star(c, x, y, s) { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i*Math.PI/4, r = i % 2 ? s*.3 : s; c.lineTo(x + Math.cos(a)*r, y + Math.sin(a)*r); } c.closePath(); c.fill(); }
function brick(c, r, hanging) {
  const g = c.createLinearGradient(r.x, 0, r.x + r.w, 0); g.addColorStop(0, '#c9694a'); g.addColorStop(1, '#8e3f2a'); c.fillStyle = g; c.fillRect(r.x, r.y, r.w, r.h);
  c.strokeStyle = '#0004'; c.lineWidth = 1; for (let yy = r.y + 12; yy < r.y + r.h; yy += 12) { c.beginPath(); c.moveTo(r.x, yy); c.lineTo(r.x + r.w, yy); c.stroke(); }
  c.fillStyle = '#ffffff30'; c.fillRect(r.x, r.y, 3, r.h); c.strokeStyle = '#0006'; c.lineWidth = 2; c.strokeRect(r.x, r.y, r.w, r.h);
}
const STARS = Array.from({length:60}, (_, i) => ({x:(i*137.5) % W, y:(i*71.3) % 300, r:.6 + (i % 3)*.5}));
function drawBackground(c, n, t, wind) {
  const th = G.themeOf(n), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const dark = th.nom === 'Nuit' || th.nom === 'Espace';
  if (dark) { c.fillStyle = '#fff'; for (const s of STARS) { c.globalAlpha = .4 + .5*Math.abs(Math.sin(t*1.5 + s.x)); c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); } c.globalAlpha = 1; }
  if (th.nom === 'Salle de bain' || th.nom === 'Jardin' || th.nom === 'Désert') { c.fillStyle = '#ffffff55'; for (const [cx, cy, s] of [[160, 70, 1], [520, 50, 1.3], [760, 100, .8]]) { const ox = (t*6*s) % (W + 200) - 100; c.beginPath(); c.arc((cx + ox) % (W + 100), cy, 26*s, 0, 7); c.arc((cx + ox) % (W + 100) + 28*s, cy + 6, 20*s, 0, 7); c.arc((cx + ox) % (W + 100) - 26*s, cy + 8, 18*s, 0, 7); c.fill(); } }
  if (th.nom === 'Volcan') { c.fillStyle = '#2b0d0b'; c.beginPath(); c.moveTo(0, GROUND); c.lineTo(180, 240); c.lineTo(260, GROUND); c.moveTo(560, GROUND); c.lineTo(740, 200); c.lineTo(900, GROUND); c.fill(); c.fillStyle = '#ff7a2e'; c.beginPath(); c.arc(740, 200 + Math.sin(t*3)*2, 6, 0, 7); c.fill(); }
  if (th.nom === 'Salle de bain') { c.strokeStyle = th.line; c.lineWidth = 2; for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, GROUND); c.stroke(); } for (let y = 0; y < GROUND; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
  // sol
  const fg = c.createLinearGradient(0, GROUND, 0, H); fg.addColorStop(0, th.floor); fg.addColorStop(1, '#0006'); c.fillStyle = th.floor; c.fillRect(0, GROUND, W, H - GROUND); c.fillStyle = fg; c.fillRect(0, GROUND, W, H - GROUND); c.fillStyle = '#ffffff25'; c.fillRect(0, GROUND, W, 3);
  // vent
  if (wind) { c.strokeStyle = '#ffffff55'; c.lineWidth = 2; const k = Math.sign(wind), a = Math.min(1, Math.abs(wind)/200); for (let i = 0; i < 6; i++) { const yy = 60 + i*52, xx = ((t*(80 + a*260)*k + i*171) % (W + 120) + W + 120) % (W + 120) - 60; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + k*(24 + a*40), yy); c.stroke(); } }
}

// ============ SCÈNE (jeu + aperçu) ============
class Scene {
  constructor(canvas, opts = {}) {
    this.cv = canvas; this.c = canvas.getContext('2d'); this.demo = !!opts.demo; this.onEnd = opts.onEnd || (() => {}); this.onChange = opts.onChange || (() => {});
    this.last = 0; this.acc = 0; this.running = false; this.setLevel(opts.n || 1);
    this.pointer = null; if (!this.demo) this.bind();
  }
  setLevel(n) {
    this.n = n; this.L = G.levelFor(n); this.t = 0; this.drops = []; this.parts = []; this.puddles = []; this.fill = 0; this.shotsLeft = this.L.shots; this.used = 0;
    this.phase = 'aim'; this.spray = null; this.lean = .1; this.aim = null; this.drag = null; this.flush = 0; this.done = false; this.demoTimer = 1; this.onChange(this);
    if (this.demo) { this.demoAim = null; }
  }
  bind() {
    const cv = this.cv, pt = e => { const r = cv.getBoundingClientRect(), s = Math.min(r.width/W, r.height/H), ox = (r.width - W*s)/2, oy = (r.height - H*s)/2; return {x:(e.clientX - r.left - ox)/s, y:(e.clientY - r.top - oy)/s}; };
    cv.addEventListener('pointerdown', e => { if (this.phase !== 'aim') return; e.preventDefault(); cv.setPointerCapture(e.pointerId); const p = pt(e); this.drag = {p0:p, p}; $('hint').style.opacity = 0; });
    cv.addEventListener('pointermove', e => { if (!this.drag) return; e.preventDefault(); this.drag.p = pt(e); });
    const end = e => { if (!this.drag) return; const d = this.drag; this.drag = null; if (this.phase !== 'aim') return; const aim = G.aimFromDrag(d.p0.x - d.p.x, d.p0.y - d.p.y); if (aim) this.fire(aim); };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', () => this.drag = null);
    cv.addEventListener('contextmenu', e => e.preventDefault());
  }
  fire(aim) { if (this.shotsLeft <= 0) return; this.shotsLeft--; this.used++; this.phase = 'spray'; this.spray = {aim, n:0, t:0, k:this.used}; this.lean = .22 + .35*aim.power; state.stats.shots++; this.onChange(this); }
  step() {
    const L = this.L; this.t += DT;
    if (this.phase === 'spray') {
      const s = this.spray; s.t += DT; const want = Math.min(N_DROPS, Math.floor(s.t/SPRAY_TIME*N_DROPS) + 1);
      while (s.n < want) { const h = G.hip(), sp = 1 + (Math.random() - .5)*.012, an = (Math.random() - .5)*.0035, c = Math.cos(an), sn = Math.sin(an);
        const vx = (s.aim.vx*c - s.aim.vy*sn)*sp, vy = (s.aim.vx*sn + s.aim.vy*c)*sp; const d = G.newDrop(h.x, h.y, vx, vy, this.t); d.i = this.dropId = (this.dropId || 0) + 1; d.born = this.t; this.drops.push(d); s.n++; }
      if (s.n >= N_DROPS) { this.phase = 'settle'; this.settleT = 0; }
    }
    let alive = 0;
    for (const d of this.drops) { if (!d.alive) continue; G.stepDrop(d, DT, L); if (d.alive) alive++; else this.onDrop(d); }
    if (this.drops.length > 400) this.drops = this.drops.filter(d => d.alive);
    if (this.phase === 'settle') { this.settleT += DT; if (!alive || this.settleT > 4) this.endShot(); }
    if (this.flush > 0) this.flush += DT;
    for (const p of this.parts) { p.vy += 700*DT; p.x += p.vx*DT; p.y += p.vy*DT; p.life -= DT; } this.parts = this.parts.filter(p => p.life > 0 && p.y < GROUND + 5);
    this.lean += ((this.drag && this.aimNow ? .15 + .35*this.aimNow.power : this.phase === 'aim' ? .1 : this.lean) - this.lean)*Math.min(1, DT*10);
    if (this.demo) { this.demoTimer -= DT; if (this.phase === 'aim' && this.demoTimer <= 0 && this.demoAim) { this.fire(this.demoAim); this.shotsLeft = 99; } }
  }
  onDrop(d) {
    const col = SKIN_BY[cur().jet].c; if (d.res === 'hit') { this.fill++; this.splash(d.x, d.y, 3); this.onChange(this); }
    else if (d.res === 'ground') { this.puddles.push({x:d.x, life:6, r:rnd(4, 9)}); this.splash(d.x, d.y, 2); if (this.puddles.length > 40) this.puddles.shift(); }
    else if (d.res === 'wall' || d.res === 'toilet') this.splash(d.x, d.y, 2);
  }
  splash(x, y, n) { for (let i = 0; i < n; i++) this.parts.push({x, y, vx:rnd(-70, 70), vy:rnd(-160, -40), life:rnd(.25, .5)}); }
  endShot() {
    this.drops = this.drops.filter(d => d.alive); this.spray = null;
    if (this.demo) { this.phase = 'aim'; this.demoTimer = 1.2; this.fill = 0; return; }
    if (this.fill >= NEED) { this.phase = 'done'; this.flush = .01; setTimeout(() => this.onEnd(true, this), 900); }
    else if (this.shotsLeft <= 0) { this.phase = 'done'; setTimeout(() => this.onEnd(false, this), 500); }
    else this.phase = 'aim';
    this.onChange(this);
  }
  frame(ts) {
    if (!this.running) return; const dt = Math.min(0.05, (ts - this.last)/1000 || 0); this.last = ts; this.acc += dt;
    while (this.acc >= DT) { this.step(); this.acc -= DT; } this.draw(); requestAnimationFrame(t => this.frame(t));
  }
  start() { if (this.running) return; this.running = true; this.last = performance.now(); requestAnimationFrame(t => this.frame(t)); }
  stop() { this.running = false; }
  draw() {
    const c = this.c, L = this.L, t = this.t, e = cur(), sx = this.cv.width/W, sy = this.cv.height/H;
    if (this.demo) { const k = 1.9; c.setTransform(k*sx, 0, 0, k*sy, -20*k*sx, -(H - 232)*k*sy + 0); } else c.setTransform(sx, 0, 0, sy, 0, 0);
    drawBackground(c, this.n, t, L.wind);
    for (const w of L.walls) brick(c, w); for (const w of L.ceil) brick(c, w, true);
    for (const p of this.puddles) { p.life -= .006; } this.puddles = this.puddles.filter(p => p.life > 0);
    c.fillStyle = jetColor(e.jet, t, 3, 0) + ''; for (const p of this.puddles) { c.globalAlpha = Math.min(.5, p.life/6); c.beginPath(); c.ellipse(p.x, GROUND + 3, p.r*1.6, 2.5, 0, 0, 7); c.fill(); } c.globalAlpha = 1;
    const T = G.toiletAt(L, t); drawToilet(c, T, L, e.toilettes, this.fill/NEED, t, this.flush > 0);
    if (this.flush > 0) { c.fillStyle = '#ffd54a'; for (let i = 0; i < 24; i++) { const a = i*2.4 + this.flush*3, r = this.flush*90 + i*3; c.globalAlpha = Math.max(0, 1 - this.flush/1.2); c.beginPath(); c.arc(T.x + T.bw/2 + Math.cos(a)*r, T.y - 40 + Math.sin(a)*r*.7 - this.flush*40, 3, 0, 7); c.fill(); } c.globalAlpha = 1; }
    // visée
    this.aimNow = null;
    if (this.drag && this.phase === 'aim') { const d = this.drag, aim = G.aimFromDrag(d.p0.x - d.p.x, d.p0.y - d.p.y); this.aimNow = aim; this.drawAim(c, d, aim); }
    // jet
    for (const d of this.drops) { if (!d.alive) continue; c.fillStyle = jetColor(e.jet, t, d.i, t - d.born); c.beginPath(); c.arc(d.x, d.y, 3.3, 0, 7); c.fill(); }
    c.fillStyle = jetColor(e.jet, t, 1, 0); for (const p of this.parts) { c.globalAlpha = Math.max(0, p.life*2.2); c.beginPath(); c.arc(p.x, p.y, 2, 0, 7); c.fill(); } c.globalAlpha = 1;
    drawFigure(c, {x:G.FIG.x, y:GROUND, lean:this.lean, t, corps:e.corps, chapeau:e.chapeau, visage:e.visage});
  }
  drawAim(c, d, aim) {
    c.save(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.setLineDash([6, 6]); c.globalAlpha = .7; c.beginPath(); c.moveTo(d.p0.x, d.p0.y); c.lineTo(d.p.x, d.p.y); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.arc(d.p0.x, d.p0.y, 9, 0, 7); c.stroke(); c.globalAlpha = 1;
    if (aim) {
      const h = G.hip(), dr = G.newDrop(h.x, h.y, aim.vx, aim.vy, this.t), frac = G.previewFrac(this.n), pts = [];
      for (let k = 0; k < 900 && dr.alive; k++) { G.stepDrop(dr, DT, this.L); if (k % 5 === 0) pts.push({x:dr.x, y:dr.y}); }
      const cnt = Math.ceil(pts.length*frac); c.fillStyle = '#fff'; for (let i = 0; i < cnt; i++) { c.globalAlpha = .9*(1 - i/Math.max(1, cnt)*.7); c.beginPath(); c.arc(pts[i].x, pts[i].y, 2.4, 0, 7); c.fill(); }
      c.globalAlpha = 1; // jauge de force
      c.fillStyle = '#0008'; rr(c, 30, 40, 14, 90, 6); c.fill(); c.fillStyle = `hsl(${120 - aim.power*120} 90% 55%)`; const hh = 86*aim.power; rr(c, 32, 128 - hh, 10, Math.max(2, hh), 4); c.fill();
    }
    c.restore();
  }
}

// ============ INTERFACE ============
let scene, preview, curLevel = 1;
function tab(name) { document.querySelectorAll('.tab').forEach(el => el.classList.toggle('visible', el.id === name)); document.querySelectorAll('nav [data-tab]').forEach(el => el.classList.toggle('active', el.dataset.tab === name)); if (name !== 'jouer' && scene) { scene.stop(); } if (name === 'perso') { renderShop(); startPreview(); } else if (preview) preview.stop(); if (name === 'jouer' && !$('game').hidden) scene.start(); }
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => tab(b.dataset.tab));
function renderCoins() { $('coins').textContent = state.coins; }
function renderLevels() {
  const box = $('levels'); box.replaceChildren(); let lastTheme = null;
  for (let n = 1; n <= LEVELS; n++) {
    const th = G.themeOf(n); if (th !== lastTheme) { lastTheme = th; const h = document.createElement('h3'); h.className = 'theme'; h.textContent = th.nom; box.append(h); }
    const b = document.createElement('button'), locked = n > state.unlocked, st = state.stars[n] || 0; b.className = 'lvl' + (locked ? ' locked' : '') + (n === state.unlocked ? ' next' : ''); b.disabled = locked;
    b.innerHTML = locked ? `🔒<small>${n}</small>` : `<b>${n}</b><small>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</small>`; b.onclick = () => play(n); box.append(b);
  }
}
function updateHud(s) {
  $('h-level').textContent = `Niveau ${s.n}`; $('h-theme').textContent = G.themeOf(s.n).nom;
  $('shots').innerHTML = Array.from({length:s.L.shots}, (_, i) => `<i class="${i < s.shotsLeft ? 'on' : ''}">💧</i>`).join('');
  $('fillbar').style.width = Math.min(100, Math.round(100*s.fill/NEED)) + '%';
  const w = s.L.wind; $('h-wind').textContent = Math.abs(w) < 5 ? '💨 calme' : `💨 ${w > 0 ? '→' : '←'} ${Math.round(Math.abs(w)/10)}`;
}
function play(n) {
  curLevel = n; $('menu').hidden = true; $('game').hidden = false; $('overlay').hidden = true; $('hint').style.opacity = n <= 2 ? 1 : 0;
  if (!scene) scene = new Scene($('cv'), {n, onEnd:endLevel, onChange:updateHud}); else scene.setLevel(n);
  scene.start();
}
function endLevel(win, s) {
  const ov = $('overlay'); ov.hidden = false;
  if (win) {
    const r = G.finishLevel(state, s.n, s.used); save(); renderCoins(); renderLevels();
    ov.innerHTML = `<div class="ov-box win"><h2>Chasse tirée ! 🚽</h2><div class="stars">${[1,2,3].map(i => `<span class="${i <= r.stars ? 'on' : ''}" style="--d:${i*.25}s">★</span>`).join('')}</div><p>+${r.coins} 🪙${r.record && r.stars > 1 ? ' · record !' : ''}</p><p class="fine">Tirs utilisés : ${s.used} / ${s.L.shots}</p><div class="ov-btns">${s.n < LEVELS ? '<button class="primary" id="ov-next">Niveau suivant →</button>' : ''}<button class="secondary" id="ov-again">Rejouer</button><button class="secondary" id="ov-menu">Niveaux</button></div></div>`;
    if ($('ov-next')) $('ov-next').onclick = () => play(s.n + 1);
  } else {
    ov.innerHTML = `<div class="ov-box"><h2>Vessie vide ! 😅</h2><p class="fine">Il manquait ${NEED - s.fill} gouttes. Essaie une autre force ou un autre angle.</p><div class="ov-btns"><button class="primary" id="ov-again">Réessayer</button><button class="secondary" id="ov-menu">Niveaux</button></div></div>`;
  }
  $('ov-again').onclick = () => play(s.n); $('ov-menu').onclick = backToMenu;
}
function backToMenu() { if (scene) scene.stop(); $('game').hidden = true; $('menu').hidden = false; renderLevels(); if (document.fullscreenElement) document.exitFullscreen?.(); }
$('back').onclick = backToMenu;
$('fs').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else { await $('game').requestFullscreen(); try { await screen.orientation.lock('landscape'); } catch {} } } catch { toast('Plein écran indisponible sur cet appareil.'); } };

// ---- Personnage / boutique ----
let shopCat = 'corps';
function renderShop() {
  $('cats').replaceChildren(...CATS.map(c => { const b = document.createElement('button'); b.type = 'button'; b.className = c.id === shopCat ? 'on' : ''; b.textContent = c.nom; b.onclick = () => { shopCat = c.id; renderShop(); }; return b; }));
  $('skins').replaceChildren(...SKINS.filter(s => s.cat === shopCat).map(s => {
    const owned = state.owned.includes(s.id), eq = state.equipped[s.cat] === s.id, el = document.createElement('button'); el.type = 'button'; el.className = 'skin' + (eq ? ' eq' : '') + (owned ? '' : ' lock');
    el.innerHTML = `<span class="sw" style="${swatch(s)}"></span><b>${s.nom}</b><small>${eq ? 'Équipé ✓' : owned ? 'Équiper' : `${s.prix} 🪙`}</small>`;
    el.onclick = () => { try { if (owned) G.equip(state, s.id); else { G.buy(state, s.id); toast(`${s.nom} acheté !`); } save(); renderCoins(); renderShop(); } catch (e) { toast(e.message); } }; return el; }));
}
function swatch(s) {
  if (s.cat === 'toilettes') return `background:linear-gradient(135deg,${s.c[0]},${s.c[1]})`;
  if (s.c === 'rainbow') return 'background:linear-gradient(90deg,red,orange,yellow,lime,cyan,blue,magenta)';
  if (s.c === 'fire') return 'background:linear-gradient(135deg,#ffe45a,#ff4a2e)';
  if (s.c) return `background:${s.c}`; return 'background:repeating-linear-gradient(45deg,#ccc 0 6px,#fff 6px 12px)';
}
function startPreview() {
  if (!preview) { preview = new Scene($('pv'), {demo:true, n:1}); const b = G.bestShot(preview.L, 0.9), a = b.deg*Math.PI/180, p = G.MIN_P + (1 - G.MIN_P)*b.pw; preview.demoAim = {angle:a, power:b.pw, p, vx:Math.cos(a)*G.VMAX*p, vy:Math.sin(a)*G.VMAX*p}; }
  preview.start();
}

state = load(); renderCoins(); renderLevels();
document.addEventListener('visibilitychange', () => { if (document.hidden) { scene?.stop(); preview?.stop(); } else { if ($('perso').classList.contains('visible')) preview?.start(); else if (!$('game').hidden) scene?.start(); } });
