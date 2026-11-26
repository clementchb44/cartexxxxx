// ===== TOILET SHOT : logique du jeu (physique, niveaux, boutique) =====
export const W = 900, H = 450, GROUND = 400;
export const G = 900;                     // gravité (px/s²)
export const VMAX = 960;                  // vitesse maximale du jet
export const FIG = {x: 84, hipY: GROUND - 50};   // position du bonhomme (hanche)
export const MIN_DRAG = 26, MAX_DRAG = 300, MIN_P = 0.3;
export const N_DROPS = 50, SPRAY_TIME = 0.8, NEED = 22;
export const LEVELS = 60;
export const TANK_W = 36, BOWL_H = 46;
export const DT = 1/120;

// ---------- Visée : un vecteur de glissé (arrière) -> vitesse initiale ----------
export function aimFromDrag(vx, vy) {
  const len = Math.hypot(vx, vy);
  if (len < MIN_DRAG || vx <= 0) return null;
  let a = Math.atan2(vy, vx);
  a = Math.max(-85*Math.PI/180, Math.min(12*Math.PI/180, a));
  const power = Math.max(0, Math.min(1, (len - MIN_DRAG)/(MAX_DRAG - MIN_DRAG)));
  const p = MIN_P + (1 - MIN_P)*power;
  return {angle: a, power, p, vx: Math.cos(a)*VMAX*p, vy: Math.sin(a)*VMAX*p};
}

// ---------- Génération des niveaux (déterministe) ----------
function rngFor(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const THEMES = [
  {nom:'Salle de bain', sky:['#bfe9ff','#e9f8ff'], wall:'#d9f1f5', floor:'#7ec0c9', line:'#ffffff55'},
  {nom:'Jardin',        sky:['#8fd3ff','#d8f5c9'], wall:'#bfe7a8', floor:'#5aa04a', line:'#ffffff33'},
  {nom:'Désert',        sky:['#ffd59a','#fff1cf'], wall:'#f3cf94', floor:'#d99b52', line:'#ffffff33'},
  {nom:'Nuit',          sky:['#1c1b45','#3b2f73'], wall:'#2b2a63', floor:'#161437', line:'#ffffff1a'},
  {nom:'Espace',        sky:['#070716','#1a0f3d'], wall:'#120d2b', floor:'#2a1c55', line:'#c9a6ff22'},
  {nom:'Volcan',        sky:['#4a1010','#a8321a'], wall:'#6b1c12', floor:'#2b0d0b', line:'#ff9a4a33'},
];
export const themeOf = n => THEMES[Math.min(THEMES.length-1, Math.floor((n-1)/10))];
export const shotsFor = n => n <= 10 ? 5 : n <= 25 ? 4 : 3;
export const previewFrac = n => Math.max(0.35, 1 - Math.max(0, n-8)*0.02);

function gen(n, rng) {
  const d = n - 1, L = {n, walls:[], ceil:[], wind:0, shots:shotsFor(n)};
  L.bw = Math.round(Math.max(52, 100 - d*1.1));
  const totalW = L.bw + TANK_W;
  L.tx = Math.round(Math.min(W - totalW - 40, 260 + d*11 + rng()*70));
  const ph = n < 3 ? 0 : Math.round(rng()*Math.min(40 + d*4, 170)/10)*10;
  L.ty = GROUND - ph;
  L.moveAx = 0; L.moveAy = 0; L.moveW = 0; L.phase = rng()*6.28;
  if (n >= 9 && (n % 3 === 0 || rng() < .35)) { L.moveAx = Math.round(Math.min(30 + (n-9)*3, 130)); L.moveW = 0.8 + rng()*0.8; }
  if (n >= 22 && rng() < .5) { L.moveAy = Math.round(Math.min(20 + (n-22)*2, 70)); L.moveW = L.moveW || 0.9 + rng()*0.6; }
  if (L.moveAx || L.moveAy) { L.tx = Math.min(Math.max(L.tx, 280 + L.moveAx), W - totalW - 20 - L.moveAx); L.ty = Math.min(L.ty, GROUND - 20 - L.moveAy); L.floating = true; }
  if (n >= 7) L.wind = Math.round((rng()*2 - 1) * Math.min(40 + (n-7)*5, 200));
  if (n >= 4) {
    const cnt = Math.min(1 + Math.floor(d/12), 3), lo = 170, hi = L.tx - L.moveAx - 70;
    for (let i = 0; i < cnt && hi > lo + 30; i++) {
      const x = Math.round(lo + (hi-lo)*((i + .2 + rng()*.6)/cnt));
      L.walls.push({x, y: GROUND - Math.round(60 + rng()*(50 + d*3)), w: 22, h: 0});
      const w = L.walls.at(-1); w.h = GROUND - w.y; w.y = Math.max(w.y, 120); w.h = GROUND - w.y;
    }
  }
  if (n >= 15) { const x = Math.round(300 + rng()*(Math.max(300, L.tx - 340) ) ); L.ceil.push({x, y: 0, w: 26, h: Math.round(90 + rng()*80)}); }
  return L;
}
// ---------- Position du toilette à l'instant t ----------
export function toiletAt(L, t) {
  const s = Math.sin(t*L.moveW + L.phase);
  const c = Math.cos(t*L.moveW*0.7 + L.phase);
  return {x: L.tx + (L.moveAx ? L.moveAx*s : 0), y: L.ty + (L.moveAy ? L.moveAy*c : 0), bw: L.bw};
}
// ---------- Gouttelettes ----------
export function newDrop(x, y, vx, vy, t0 = 0) { return {x, y, vx, vy, alive:true, t:t0, res:null}; }
const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
export function stepDrop(d, dt, L) {
  if (!d.alive) return;
  d.vx += L.wind*dt; d.vy += G*dt;
  const px = d.x, py = d.y;
  d.x += d.vx*dt; d.y += d.vy*dt; d.t += dt;
  const T = toiletAt(L, d.t), top = T.y - BOWL_H;
  // dans la cuvette : ouverture entre les rebords
  if (d.vy > 0 && py < top + 2 && d.y >= top + 2 && px >= T.x + 5 && d.x <= T.x + T.bw - 5) { d.alive = false; d.res = 'hit'; return; }
  if (inRect(d.x, d.y, {x:T.x, y:top, w:T.bw, h:BOWL_H}) || inRect(d.x, d.y, {x:T.bw + T.x, y:top - 56, w:TANK_W, h:BOWL_H + 56})) { d.alive = false; d.res = 'toilet'; return; }
  // plateau / pilier sous le toilette
  if (L.floating) { if (inRect(d.x, d.y, {x:T.x - 8, y:T.y, w:T.bw + TANK_W + 16, h:14})) { d.alive = false; d.res = 'toilet'; return; } }
  else if (L.ty < GROUND && inRect(d.x, d.y, {x:T.x - 8, y:T.y, w:T.bw + TANK_W + 16, h:GROUND - T.y})) { d.alive = false; d.res = 'toilet'; return; }
  for (const w of L.walls) if (inRect(d.x, d.y, w)) { d.alive = false; d.res = 'wall'; return; }
  for (const w of L.ceil) if (inRect(d.x, d.y, w)) { d.alive = false; d.res = 'wall'; return; }
  if (d.y >= GROUND) { d.y = GROUND; d.alive = false; d.res = 'ground'; return; }
  if (d.x > W + 60 || d.x < -60 || d.y > H + 80) { d.alive = false; d.res = 'out'; }
}
export const hip = lean => ({x: FIG.x + 16, y: FIG.hipY - 4});

// ---------- Solveur : vérifie qu'un niveau a au moins une solution ----------
export function simulateShot(L, aim, t0 = 0, spread = true) {
  let hits = 0; const n = 10;
  for (let i = 0; i < n; i++) {
    const h = hip(), d = newDrop(h.x, h.y, aim.vx, aim.vy, t0 + (i/(n-1))*SPRAY_TIME);
    for (let k = 0; k < 900 && d.alive; k++) stepDrop(d, DT, L);
    if (d.res === 'hit') hits++;
  }
  return hits / n;
}
export function bestShot(L, early = 0.8) {
  let best = {frac:0};
  const phases = (L.moveAx || L.moveAy) ? [0, 1.1, 2.2, 3.3, 4.4, 5.5] : [0];
  for (let deg = -80; deg <= 8; deg += 2) for (let pw = 0; pw <= 1.0001; pw += 0.02) {
    const a = deg*Math.PI/180, p = MIN_P + (1-MIN_P)*pw, aim = {vx: Math.cos(a)*VMAX*p, vy: Math.sin(a)*VMAX*p};
    for (const t0 of phases) { const f = simulateShot(L, aim, t0); if (f > best.frac) { best = {frac:f, deg, pw, t0}; if (f >= early) return best; } }
  }
  return best;
}
const cache = new Map();
// Essai retenu pour chaque niveau (calculé hors ligne par le solveur : garantit un niveau jouable sans calcul lent)
export const ATTEMPTS = {"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0,"31":0,"32":0,"33":0,"34":0,"35":0,"36":0,"37":0,"38":0,"39":0,"40":0,"41":0,"42":0,"43":0,"44":0,"45":0,"46":1,"47":0,"48":0,"49":0,"50":1,"51":0,"52":0,"53":0,"54":0,"55":0,"56":0,"57":1,"58":0,"59":0,"60":0};
export function levelFor(n, solve = false) {
  n = Math.max(1, Math.min(LEVELS, Math.floor(n)));
  if (cache.has(n)) return cache.get(n);
  let L = null;
  if (!solve && ATTEMPTS[n] !== undefined) { L = gen(n, rngFor(n*7919 + ATTEMPTS[n]*104729)); L.attempt = ATTEMPTS[n]; }
  for (let attempt = 0; solve && attempt < 40 && !L; attempt++) {
    const cand = gen(n, rngFor(n*7919 + attempt*104729));
    const b = bestShot(cand, 0.8);
    if (b.frac >= 0.6) { cand.best = b; cand.attempt = attempt; L = cand; }
  }
  if (!L) { L = gen(n, rngFor(n)); L.walls = []; L.ceil = []; L.wind = 0; L.moveAx = L.moveAy = 0; L.floating = false; L.ty = GROUND; }
  cache.set(n, L); return L;
}

// ---------- Récompenses ----------
export function starsFor(L, used) { const m = L.shots; if (used <= (m >= 4 ? 2 : 1)) return 3; if (used <= m-1) return 2; return 1; }
export const coinsFor = (n, stars) => 6 + Math.floor(n*0.8) + stars*5;

// ---------- Boutique de skins ----------
export const CATS = [
  {id:'corps', nom:'Corps'}, {id:'chapeau', nom:'Chapeaux'}, {id:'visage', nom:'Visage'}, {id:'jet', nom:'Jet'}, {id:'toilettes', nom:'Toilettes'},
];
export const SKINS = [
  {id:'corps_noir', cat:'corps', nom:'Noir', prix:0, c:'#1a1a22'}, {id:'corps_rouge', cat:'corps', nom:'Rouge', prix:40, c:'#d8333b'}, {id:'corps_bleu', cat:'corps', nom:'Bleu', prix:40, c:'#2f6fe0'},
  {id:'corps_vert', cat:'corps', nom:'Vert', prix:60, c:'#2fa35a'}, {id:'corps_rose', cat:'corps', nom:'Rose', prix:80, c:'#ff5fa8'}, {id:'corps_or', cat:'corps', nom:'Doré', prix:400, c:'#f2b72a'},
  {id:'corps_arc', cat:'corps', nom:'Arc-en-ciel', prix:900, c:'rainbow'},
  {id:'chap_none', cat:'chapeau', nom:'Aucun', prix:0}, {id:'chap_cap', cat:'chapeau', nom:'Casquette', prix:60, c:'#d8333b'}, {id:'chap_fete', cat:'chapeau', nom:'Chapeau de fête', prix:100, c:'#ff5fa8'},
  {id:'chap_chantier', cat:'chapeau', nom:'Casque de chantier', prix:150, c:'#ffcf3d'}, {id:'chap_haut', cat:'chapeau', nom:'Haut-de-forme', prix:200, c:'#222'},
  {id:'chap_sorcier', cat:'chapeau', nom:'Chapeau de sorcier', prix:260, c:'#6a3fd6'}, {id:'chap_couronne', cat:'chapeau', nom:'Couronne', prix:500, c:'#ffcf3d'},
  {id:'vis_none', cat:'visage', nom:'Aucun', prix:0}, {id:'vis_lunettes', cat:'visage', nom:'Lunettes de soleil', prix:80}, {id:'vis_mous', cat:'visage', nom:'Moustache', prix:70},
  {id:'vis_ninja', cat:'visage', nom:'Bandeau ninja', prix:140}, {id:'vis_masque', cat:'visage', nom:'Masque de héros', prix:220},
  {id:'jet_jaune', cat:'jet', nom:'Classique', prix:0, c:'#ffe03a'}, {id:'jet_eau', cat:'jet', nom:'Eau pure', prix:50, c:'#5fc8ff'}, {id:'jet_slime', cat:'jet', nom:'Slime', prix:120, c:'#7dff5a'},
  {id:'jet_bonbon', cat:'jet', nom:'Bonbon', prix:150, c:'#ff7ac8'}, {id:'jet_feu', cat:'jet', nom:'Feu', prix:350, c:'fire'}, {id:'jet_or', cat:'jet', nom:'Or liquide', prix:500, c:'#ffcf3d'}, {id:'jet_arc', cat:'jet', nom:'Arc-en-ciel', prix:900, c:'rainbow'},
  {id:'toi_blanc', cat:'toilettes', nom:'Classique', prix:0, c:['#ffffff','#cfd8e3']}, {id:'toi_rose', cat:'toilettes', nom:'Rose', prix:100, c:['#ffd0e6','#e58db8']}, {id:'toi_noir', cat:'toilettes', nom:'Noir mat', prix:150, c:['#58586a','#2b2b38']},
  {id:'toi_or', cat:'toilettes', nom:'Doré', prix:600, c:['#fff0a8','#d99a14']}, {id:'toi_diamant', cat:'toilettes', nom:'Diamant', prix:1500, c:['#e8ffff','#6fd8ff']},
];
export const SKIN_BY = Object.fromEntries(SKINS.map(s => [s.id, s]));
export const DEFAULT_EQ = {corps:'corps_noir', chapeau:'chap_none', visage:'vis_none', jet:'jet_jaune', toilettes:'toi_blanc'};
export const SAVE_KEY = 'toiletshot-save-v1';
export function initial() { return {v:1, coins:0, unlocked:1, stars:{}, owned:SKINS.filter(s => s.prix === 0).map(s => s.id), equipped:{...DEFAULT_EQ}, stats:{shots:0, wins:0, flushes:0}}; }
export function normalize(s) {
  const b = initial(); if (!s || typeof s !== 'object') return b;
  const out = {...b};
  out.coins = Number.isFinite(s.coins) && s.coins >= 0 ? Math.min(Math.floor(s.coins), 1e7) : 0;
  out.unlocked = Math.max(1, Math.min(LEVELS, Math.floor(s.unlocked) || 1));
  out.stars = {}; for (const [k, v] of Object.entries(s.stars || {})) if (+k >= 1 && +k <= LEVELS && [1,2,3].includes(v)) out.stars[+k] = v;
  out.owned = [...new Set([...b.owned, ...(Array.isArray(s.owned) ? s.owned.filter(id => SKIN_BY[id]) : [])])];
  out.equipped = {...DEFAULT_EQ}; for (const c of CATS) { const id = s.equipped?.[c.id]; if (SKIN_BY[id]?.cat === c.id && out.owned.includes(id)) out.equipped[c.id] = id; }
  out.stats = {...b.stats, ...(s.stats || {})};
  return out;
}
export function finishLevel(state, n, used) {
  const L = levelFor(n), stars = starsFor(L, used), coins = coinsFor(n, stars), prev = state.stars[n] || 0;
  state.coins += coins; state.stars[n] = Math.max(prev, stars); state.stats.wins++;
  if (n < LEVELS) state.unlocked = Math.max(state.unlocked, n + 1);
  return {stars, coins, record: stars > prev};
}
export function buy(state, id) {
  const s = SKIN_BY[id]; if (!s) throw Error('Skin inconnu.'); if (state.owned.includes(id)) throw Error('Déjà acheté.');
  if (state.coins < s.prix) throw Error('Pas assez de pièces.'); state.coins -= s.prix; state.owned.push(id); state.equipped[s.cat] = id; return s;
}
export function equip(state, id) { const s = SKIN_BY[id]; if (!s || !state.owned.includes(id)) throw Error('Skin non possédé.'); state.equipped[s.cat] = id; return s; }
