// ===== LOGIQUE DU JEU (pure : action(state, body, now, random)) =====
import { ITEMS, ITEM_BY, SLOTS, RAR_KEYS, RARETES, CLASSES, SKINS, HAIR_COLORS, HAIR_STYLES, EYES } from './items.mjs';
export const SAVE_KEY = 'armurerie-save-v1';
export const INTERVAL = 15 * 60 * 1000;   // 1 booster toutes les 15 min
export const MAX_RESERVE = 10;
export const MAX_OPEN = 30;
export const MAX_LEVEL = 100;
export const SHOP = [
  {id:'rare', nom:'Pack Rare+', desc:'5 pièces, au moins Aguerri.', prix:6},
  {id:'slot', nom:'Pack ciblé', desc:'5 pièces de l’emplacement de ton choix.', prix:4},
];
export const XP = {open:4, sell:1, daily:5};
export const DAILY = [1, 1, 2, 2, 3, 3, 5];     // jetons par jour de série
export const xpNeeded = l => 40 + 25*(l-1) + 4*(l-1)**2;
export function levelInfo(xp = 0) {
  let level = 1, left = Math.max(0, Math.floor(xp));
  while (level < MAX_LEVEL && left >= xpNeeded(level)) { left -= xpNeeded(level); level++; }
  return {level, into: level >= MAX_LEVEL ? 0 : left, need: level >= MAX_LEVEL ? 0 : xpNeeded(level)};
}
export const dayOf = now => new Date(now).toLocaleDateString('sv-SE', {timeZone:'Europe/Paris'});
export const intervalFor = s => INTERVAL * (s.classe === 'archer' ? 0.9 : 1);
export const power = s => Object.values(s.equipped||{}).reduce((a,id)=>a+(ITEM_BY.get(id)?.puissance||0),0);

export function initial(now = Date.now()) {
  return {v:1, created:false, nom:'Aventurier', classe:'chevalier', look:{skin:1,hair:0,hairColor:1,eyes:1},
    jetons:2, boosters:3, bonus:0, anchor:now, xp:0, collection:{}, equipped:{},
    stats:{opened:0, cards:0, sold:0, packs:0}, daily:{last:null, streak:0}, created_at:now};
}
const clampInt = (v, lo, hi, d) => Number.isInteger(v) && v >= lo && v <= hi ? v : d;
export function normalize(s, now = Date.now()) {
  const b = initial(now); if (!s || typeof s !== 'object') return b;
  const out = {...b, ...s};
  out.created = !!s.created; out.nom = String(s.nom||b.nom).slice(0,16) || b.nom;
  out.classe = CLASSES[s.classe] ? s.classe : 'chevalier';
  const l = s.look || {};
  out.look = {skin:clampInt(l.skin,0,SKINS.length-1,1), hair:clampInt(l.hair,0,HAIR_STYLES.length-1,0), hairColor:clampInt(l.hairColor,0,HAIR_COLORS.length-1,1), eyes:clampInt(l.eyes,0,EYES.length-1,1)};
  out.jetons = Number.isFinite(s.jetons) && s.jetons >= 0 ? Math.min(s.jetons, 1e6) : b.jetons;
  out.boosters = clampInt(s.boosters, 0, 1000, b.boosters); out.bonus = clampInt(s.bonus, 0, 100000, 0);
  out.xp = Math.max(0, Math.floor(s.xp||0)); out.anchor = Number.isFinite(s.anchor) ? s.anchor : now;
  out.collection = {}; for (const [k,v] of Object.entries(s.collection||{})) if (ITEM_BY.has(+k) && Number.isSafeInteger(v) && v > 0) out.collection[+k] = Math.min(v, 100000);
  out.equipped = {}; for (const [k,v] of Object.entries(s.equipped||{})) { const it = ITEM_BY.get(v); if (it && it.slot === k && out.collection[v] > 0) out.equipped[k] = v; }
  out.stats = {...b.stats, ...(s.stats||{})}; out.daily = {last:s.daily?.last||null, streak:clampInt(s.daily?.streak,0,1000,0)};
  return out;
}
export function reserve(s, now = Date.now()) {
  const iv = intervalFor(s);
  if (s.boosters >= MAX_RESERVE) return {count:s.boosters, next:0};
  const added = Math.max(0, Math.floor((now - s.anchor)/iv));
  const count = Math.min(MAX_RESERVE, s.boosters + added);
  return {count, next: count >= MAX_RESERVE ? 0 : iv - ((now - s.anchor) % iv)};
}
function refill(s, now) {
  const iv = intervalFor(s);
  if (s.boosters >= MAX_RESERVE) { s.anchor = now; return; }
  const added = Math.max(0, Math.floor((now - s.anchor)/iv));
  if (added) { s.boosters = Math.min(MAX_RESERVE, s.boosters + added); s.anchor = s.boosters >= MAX_RESERVE ? now : s.anchor + added*iv; }
}
export function dailyStatus(s, now = Date.now()) {
  const today = dayOf(now), y = dayOf(now-86400000), claimed = s.daily.last === today;
  const streak = claimed || s.daily.last === y ? s.daily.streak : 0;
  return {claimed, streak, next: claimed ? streak % 7 : streak % 7};
}
export function gainXp(s, n) {
  const before = levelInfo(s.xp).level; s.xp = Math.floor(s.xp) + n; const after = levelInfo(s.xp).level, ups = [];
  for (let l = before+1; l <= after; l++) { const j = l % 5 === 0 ? 2 : 0; s.bonus++; s.jetons = Math.round((s.jetons+j)*100)/100; ups.push({level:l, boosters:1, jetons:j}); }
  return ups;
}
export const sellValue = (s, it) => Math.round(RARETES[it.rarete].vente * (s.classe === 'chevalier' ? 1.15 : 1) * 1000) / 1000;

function pickRarity(random, min = 0) {
  const keys = RAR_KEYS.slice(min), tot = keys.reduce((a,k)=>a+RARETES[k].chance,0);
  let r = random()*tot; for (const k of keys) { r -= RARETES[k].chance; if (r < 0) return k; } return keys.at(-1);
}
const POOL = Object.fromEntries(RAR_KEYS.map(k => [k, ITEMS.filter(i => i.rarete === k)]));
export function drawItem(random, min = 0, slot = null) {
  const k = pickRarity(random, min), pool = slot ? POOL[k].filter(i => i.slot === slot) : POOL[k];
  return pool[Math.floor(random()*pool.length)];
}

export function action(state, body, now = Date.now(), random = Math.random) {
  const s = state, result = {message:''}; let xpGain = 0;
  if (!body || typeof body !== 'object') throw Error('Action invalide.');
  if (!s.created && body.action !== 'create' && body.action !== 'sync') throw Error('Crée d’abord ton personnage.');
  refill(s, now);
  const give = (it) => { const isNew = !s.collection[it.id]; s.collection[it.id] = (s.collection[it.id]||0)+1; s.stats.cards++; return {...it, new:isNew}; };
  if (body.action === 'create') {
    if (s.created) throw Error('Ton personnage existe déjà.');
    const nom = String(body.nom||'').trim().slice(0,16); if (!nom) throw Error('Choisis un nom pour ton héros.');
    if (!CLASSES[body.classe]) throw Error('Classe inconnue.');
    const l = body.look||{};
    s.nom = nom; s.classe = body.classe; s.created = true;
    s.look = {skin:clampInt(l.skin,0,SKINS.length-1,1), hair:clampInt(l.hair,0,HAIR_STYLES.length-1,0), hairColor:clampInt(l.hairColor,0,HAIR_COLORS.length-1,1), eyes:clampInt(l.eyes,0,EYES.length-1,1)};
    s.anchor = now; result.message = `Bienvenue, ${nom} !`;
  } else if (body.action === 'open') {
    const n = Math.min(MAX_OPEN, Math.max(1, Math.floor(body.count||1)));
    if (s.boosters + s.bonus < n) throw Error('Pas assez de boosters.');
    const wasFull = s.boosters >= MAX_RESERVE; const useBonus = Math.min(s.bonus, n); s.bonus -= useBonus; s.boosters -= n - useBonus;
    if (wasFull && s.boosters < MAX_RESERVE) s.anchor = now;
    result.cards = []; for (let i = 0; i < n*5; i++) result.cards.push(give(drawItem(random)));
    s.stats.opened += n; xpGain = XP.open*n; result.message = n === 1 ? 'Cinq nouvelles pièces !' : `${n*5} nouvelles pièces !`;
  } else if (body.action === 'buy') {
    const item = SHOP.find(i => i.id === body.item); if (!item) throw Error('Objet inconnu.');
    if (item.id === 'slot' && !SLOTS.some(x => x.id === body.slot)) throw Error('Choisis un emplacement.');
    if (s.jetons < item.prix) throw Error('Pas assez de jetons.');
    s.jetons = Math.round((s.jetons - item.prix)*100)/100;
    result.cards = []; for (let i = 0; i < 5; i++) result.cards.push(give(item.id === 'rare' ? drawItem(random, 1) : drawItem(random, 0, body.slot)));
    s.stats.packs++; xpGain = XP.open; result.message = `${item.nom} ouvert !`;
  } else if (body.action === 'sell') {
    const sel = new Set((Array.isArray(body.rarities) ? body.rarities : []).filter(r => RARETES[r]));
    if (!sel.size) throw Error('Choisis au moins une rareté à vendre.');
    let sold = 0, value = 0;
    for (const [k, n] of Object.entries(s.collection)) { const it = ITEM_BY.get(+k); if (!it || !sel.has(it.rarete) || n <= 1) continue;
      sold += n-1; value += (n-1)*sellValue(s, it); s.collection[k] = 1; }
    if (!sold) throw Error('Aucun doublon à vendre dans cette sélection.');
    value = Math.round(value*100)/100; s.jetons = Math.round((s.jetons+value)*100)/100; s.stats.sold += sold;
    result.message = `${sold} doublon${sold>1?'s':''} vendu${sold>1?'s':''} : +${value} jetons.`; xpGain = XP.sell;
  } else if (body.action === 'equip') {
    const it = ITEM_BY.get(body.id); if (!it || !s.collection[it.id]) throw Error('Tu ne possèdes pas cette pièce.');
    s.equipped[it.slot] = it.id; result.message = `${it.nom} équipé.`;
  } else if (body.action === 'unequip') {
    if (!SLOTS.some(x => x.id === body.slot)) throw Error('Emplacement inconnu.'); delete s.equipped[body.slot]; result.message = 'Pièce retirée.';
  } else if (body.action === 'daily') {
    const st = dailyStatus(s, now); if (st.claimed) throw Error('Tu as déjà récupéré ta récompense aujourd’hui.');
    const streak = st.streak + 1; let j = DAILY[(streak-1)%7]; if (s.classe === 'voleur') j = Math.round(j*1.25*100)/100;
    s.daily = {last: dayOf(now), streak}; s.jetons = Math.round((s.jetons+j)*100)/100;
    if (streak % 7 === 0) s.bonus += 2;
    result.message = `+${j} jetons (jour ${streak}) !${streak%7===0?' +2 boosters bonus !':''}`; xpGain = XP.daily;
  } else if (body.action === 'rename') {
    const nom = String(body.nom||'').trim().slice(0,16); if (!nom) throw Error('Nom vide.'); s.nom = nom; result.message = 'Nom changé.';
  } else if (body.action !== 'sync') throw Error('Action inconnue.');
  let levelUps = [];
  if (xpGain) { if (s.classe === 'mage') xpGain = Math.round(xpGain*1.1*10)/10; levelUps = gainXp(s, Math.max(1, Math.round(xpGain))); if (levelUps.length) result.message += ` Niveau ${levelUps.at(-1).level} atteint !`; }
  return {state:s, ...result, levelUps};
}
