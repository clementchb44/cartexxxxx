import { SAVE_KEY, INTERVAL, MAX_RESERVE, SHOP, DAILY, initial, normalize, action as play, levelInfo, reserve, dailyStatus, power, sellValue } from './game.mjs?v=1';
import { ITEMS, ITEM_BY, SLOTS, SLOT_BY, RAR_KEYS, RARETES, CLASSES, SKINS, HAIR_COLORS, HAIR_STYLES, EYES, DEFS, pieceSvg, characterHtml } from './items.mjs?v=1';
const $ = id => document.getElementById(id);
$('defs').innerHTML = DEFS;
let state, busy = false, pickSlot = null, fSlot = 'all', fRar = 'all', sellSel = new Set(['brut']);
const BIG = ['legendaire','mythique','celeste'];

function load() { try { const raw = localStorage.getItem(SAVE_KEY); return normalize(raw ? JSON.parse(raw) : null); } catch { return initial(); } }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { $('status').textContent = 'Sauvegarde impossible (navigateur en mode privé ?)'; } }
const fmt = n => (Math.round(n*100)/100).toLocaleString('fr-FR');
function toast(msg) { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 3200); }
function flash() { const f = document.createElement('div'); f.className = 'flash'; document.body.append(f); setTimeout(() => f.remove(), 900); }

function request(act, extra = {}) {
  if (busy) return null; busy = true;
  try {
    const res = play(state, {action: act, ...extra}, Date.now(), Math.random);
    save(); $('status').textContent = res.message || '';
    if (res.levelUps?.length) toast(`🎉 Niveau ${res.levelUps.at(-1).level} ! +${res.levelUps.length} booster${res.levelUps.length>1?'s':''} bonus`);
    render(); return res;
  } catch (e) { state = load(); $('status').textContent = e.message; render(); return null; }
  finally { busy = false; }
}

// ---------- Cartes ----------
function cardEl(it, o = {}) {
  const el = document.createElement('article'); const rar = RARETES[it.rarete];
  el.className = `card r-${it.rarete}${o.locked?' locked':''}${o.selectable?' selectable':''}${o.equipped?' equipped':''}`;
  el.style.setProperty('--accent', rar.couleur);
  el.innerHTML = o.locked
    ? `<div class="top"><span>${rar.label}</span><span>${(SLOT_BY[it.slot].icone)}</span></div><div class="art">?</div><h4>???</h4><div class="slot-tag">${SLOT_BY[it.slot].nom}</div>`
    : `<div class="top"><span>${rar.label}</span><span>+${it.puissance}</span></div><div class="art">${pieceSvg(it)}</div><h4>${it.nom}</h4><div class="slot-tag">${SLOT_BY[it.slot].nom}</div>${o.qty>1?`<span class="qty">×${o.qty}</span>`:''}${o.isNew?'<span class="newtag">NOUVEAU</span>':''}`;
  return el;
}

// ---------- Personnage ----------
function attachTilt(root) {
  const sc = root.querySelector('.char-scene'), c = root.querySelector('.char-3d'); if (!sc) return;
  sc.addEventListener('pointermove', e => { const r = sc.getBoundingClientRect(), x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5; c.classList.add('ctl'); c.style.transform = `rotateY(${x*50}deg) rotateX(${-y*20}deg)`; });
  sc.addEventListener('pointerleave', () => { c.classList.remove('ctl'); c.style.transform = ''; });
}
function drawChar(el, s) { el.innerHTML = characterHtml(s); attachTilt(el); }
function renderPerso() {
  drawChar($('stage-char'), state); $('power').textContent = power(state);
  $('slots').replaceChildren(...SLOTS.slice().reverse().map(sl => {
    const it = ITEM_BY.get(state.equipped[sl.id]), b = document.createElement('button'); b.className = 'slot' + (pickSlot === sl.id ? ' on' : ''); b.type = 'button';
    b.innerHTML = `<span class="ico">${it ? pieceSvg(it) : sl.icone}</span><span><b>${sl.nom}</b><small>${it ? it.nom : 'Vide'}</small></span>`;
    b.onclick = () => { pickSlot = pickSlot === sl.id ? null : sl.id; renderPerso(); }; return b; }));
  const pk = $('picker'); pk.hidden = !pickSlot; if (!pickSlot) return;
  const sl = SLOT_BY[pickSlot], owned = ITEMS.filter(i => i.slot === pickSlot && state.collection[i.id]).sort((a,b) => RAR_KEYS.indexOf(b.rarete)-RAR_KEYS.indexOf(a.rarete) || a.variant-b.variant);
  $('picker-title').textContent = `${sl.nom} (${owned.length} possédée${owned.length>1?'s':''})`;
  const list = owned.map(it => { const c = cardEl(it, {qty:state.collection[it.id], selectable:true, equipped:state.equipped[pickSlot]===it.id}); c.onclick = () => request('equip', {id:it.id}); return c; });
  if (state.equipped[pickSlot]) { const b = document.createElement('button'); b.className = 'secondary'; b.textContent = 'Retirer la pièce'; b.onclick = () => request('unequip', {slot:pickSlot}); list.unshift(b); }
  if (!owned.length) { const p = document.createElement('p'); p.className = 'fine'; p.textContent = 'Tu n’as encore aucune pièce pour cet emplacement : ouvre des boosters !'; list.push(p); }
  $('picker-list').replaceChildren(...list);
}

// ---------- Boosters ----------
let reveal = null;
function renderReserve() {
  const r = reserve(state, Date.now()), total = r.count + state.bonus;
  $('reserve').textContent = `${r.count} / ${MAX_RESERVE} boosters${state.bonus ? ` + ${state.bonus} bonus` : ''}`;
  $('reserve-track').replaceChildren(...Array.from({length:MAX_RESERVE}, (_, i) => Object.assign(document.createElement('i'), {className: i < r.count ? 'on' : ''})));
  $('reserve-next').textContent = r.next ? `Prochain booster dans ${Math.floor(r.next/60000)} min ${String(Math.floor(r.next/1000)%60).padStart(2,'0')} s` : 'Réserve pleine !';
  for (const [id, n] of [['open1',1],['open5',5],['open10',10]]) { $(id).disabled = total < n; }
}
function renderPacks() {
  renderReserve(); const now = Date.now();
  const d = dailyStatus(state, now); const box = $('daily'); box.replaceChildren();
  const lab = document.createElement('b'); lab.textContent = '🎁 Cadeau du jour'; box.append(lab);
  for (let i = 0; i < 7; i++) { const e = document.createElement('span'); const done = d.claimed ? ((d.streak-1)%7)+1 : d.streak%7; e.className = 'day' + (i < done ? ' done' : '') + (!d.claimed && i === d.next ? ' now' : ''); e.textContent = i === 6 ? '🎁' : `+${DAILY[i]}`; box.append(e); }
  const btn = document.createElement('button'); btn.className = 'primary'; btn.textContent = d.claimed ? 'Déjà récupéré' : 'Récupérer'; btn.disabled = d.claimed; btn.onclick = () => request('daily'); box.append(btn);
  const pt = $('pack-title'), pc = $('pack-cards');
  if (reveal) { pt.textContent = reveal.title; pc.replaceChildren(...reveal.cards.map((c, i) => { const el = cardEl(ITEM_BY.get(c.id), {qty:0, isNew:c.new}); el.classList.add(BIG.includes(c.rarete) ? 'big-pull' : 'reveal'); el.style.setProperty('--n', i); return el; })); }
}
function open(n) { const res = request('open', {count:n}); if (res?.cards) { showReveal(res.message, res.cards); } }
function showReveal(title, cards) {
  const order = cards.slice().sort((a,b) => RAR_KEYS.indexOf(a.rarete)-RAR_KEYS.indexOf(b.rarete)); reveal = {title, cards: order};
  if (cards.some(c => BIG.includes(c.rarete))) flash(); renderPacks();
}
$('open1').onclick = () => open(1); $('open5').onclick = () => open(5); $('open10').onclick = () => open(10);

// ---------- Collection ----------
function chips(el, list, cur, set) { el.replaceChildren(...list.map(([id, label]) => { const b = document.createElement('button'); b.type = 'button'; b.className = id === cur ? 'on' : ''; b.textContent = label; b.onclick = () => { set(id); renderCollection(); }; return b; })); }
function renderCollection() {
  const have = ITEMS.filter(i => state.collection[i.id]).length; $('count').textContent = `${have} / ${ITEMS.length} pièces découvertes`;
  chips($('f-slot'), [['all','Tout'], ...SLOTS.map(s => [s.id, `${s.icone} ${s.nom}`])], fSlot, v => fSlot = v);
  chips($('f-rar'), [['all','Toutes raretés'], ...RAR_KEYS.map(k => [k, RARETES[k].label])], fRar, v => fRar = v);
  const list = ITEMS.filter(i => (fSlot === 'all' || i.slot === fSlot) && (fRar === 'all' || i.rarete === fRar))
    .sort((a,b) => RAR_KEYS.indexOf(b.rarete)-RAR_KEYS.indexOf(a.rarete) || SLOTS.findIndex(s=>s.id===a.slot)-SLOTS.findIndex(s=>s.id===b.slot) || a.variant-b.variant);
  $('coll').replaceChildren(...list.map(i => cardEl(i, {qty:state.collection[i.id]||0, locked:!state.collection[i.id]})));
  const sr = $('sell-rar'); sr.replaceChildren(...RAR_KEYS.map(k => { const dup = ITEMS.filter(i => i.rarete === k).reduce((a,i)=>a+Math.max(0,(state.collection[i.id]||0)-1),0);
    const l = document.createElement('label'); l.className = sellSel.has(k) ? 'on' : ''; l.innerHTML = `<input type="checkbox" ${sellSel.has(k)?'checked':''}>${RARETES[k].label} (${dup})`;
    l.querySelector('input').onchange = e => { e.target.checked ? sellSel.add(k) : sellSel.delete(k); renderCollection(); }; return l; }));
  $('sell').disabled = !Object.values(state.collection).some(n => n > 1);
}
$('sell').onclick = () => request('sell', {rarities:[...sellSel]});

// ---------- Boutique ----------
let shopSlot = 'casque';
function renderShop() {
  $('shop').replaceChildren(...SHOP.map(it => { const el = document.createElement('div'); el.className = 'shop-item';
    el.innerHTML = `<h2>${it.nom}</h2><p class="fine">${it.desc}</p>`;
    if (it.id === 'slot') { const sel = document.createElement('select'); sel.setAttribute('aria-label','Emplacement'); sel.innerHTML = SLOTS.map(s => `<option value="${s.id}">${s.icone} ${s.nom}</option>`).join(''); sel.value = shopSlot; sel.onchange = () => shopSlot = sel.value; el.append(sel); }
    const b = document.createElement('button'); b.className = 'primary'; b.textContent = `Acheter · ${it.prix} ◉`; b.disabled = state.jetons < it.prix;
    b.onclick = () => { const res = request('buy', {item:it.id, slot:shopSlot}); if (res?.cards) { showReveal(res.message, res.cards); tab('packs'); } }; el.append(b); return el; }));
}

// ---------- Profil ----------
function renderProfile() {
  const lv = levelInfo(state.xp), c = CLASSES[state.classe];
  drawChar($('pf-char'), state); $('pf-name').textContent = state.nom; $('pf-class').textContent = `${c.icone} ${c.nom} — ${c.perk}`;
  $('pf-level').textContent = `Niveau ${lv.level}`; $('pf-xp').style.width = lv.need ? `${Math.round(100*lv.into/lv.need)}%` : '100%'; $('pf-xptext').textContent = lv.need ? `${lv.into} / ${lv.need} XP` : 'Niveau maximum';
  const have = ITEMS.filter(i => state.collection[i.id]).length, st = state.stats;
  $('pf-stats').innerHTML = [['Puissance', power(state)], ['Pièces découvertes', `${have} / ${ITEMS.length}`], ['Boosters ouverts', st.opened], ['Cartes obtenues', st.cards], ['Packs achetés', st.packs], ['Doublons vendus', st.sold], ['Jours de série', state.daily.streak], ['Jetons', fmt(state.jetons)]].map(([k, v]) => `<p><span>${k}</span><b>${v}</b></p>`).join('');
  $('pf-bars').innerHTML = RAR_KEYS.map(k => { const all = ITEMS.filter(i => i.rarete === k), n = all.filter(i => state.collection[i.id]).length; return `<p class="bar-row"><span>${RARETES[k].label}</span><em><u style="width:${Math.round(100*n/all.length)}%;background:${RARETES[k].couleur}"></u></em><b>${n} / ${all.length}</b></p>`; }).join('');
  $('who-name').textContent = state.nom; $('who-level').textContent = `Niv. ${lv.level} · ${c.nom}`;
}
$('rename-form').onsubmit = e => { e.preventDefault(); if ($('rename-input').value.trim()) { request('rename', {nom:$('rename-input').value}); $('rename-input').value = ''; } };
$('reset').onclick = () => { if (confirm('Tout effacer (collection, niveau, jetons) et créer un nouveau héros ?')) { state = initial(); save(); startCreate(); render(); } };

// ---------- Onglets ----------
function tab(name) { document.querySelectorAll('.tab').forEach(el => el.classList.toggle('visible', el.id === name)); document.querySelectorAll('nav [data-tab]').forEach(el => el.classList.toggle('active', el.dataset.tab === name)); }
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => tab(b.dataset.tab));

// ---------- Création du héros ----------
let draft = {nom:'', classe:'chevalier', look:{skin:1, hair:0, hairColor:1, eyes:1}};
function renderCreate() {
  drawChar($('create-char'), {look:draft.look, classe:draft.classe, equipped:{}});
  $('c-class').replaceChildren(...Object.entries(CLASSES).map(([id, c]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cls' + (draft.classe === id ? ' on' : ''); b.innerHTML = `<b>${c.icone} ${c.nom}</b><small>${c.desc}</small><em>${c.perk}</em>`; b.onclick = () => { draft.classe = id; renderCreate(); }; return b; }));
  const sw = (el, list, key) => el.replaceChildren(...list.map((col, i) => { const b = document.createElement('button'); b.type = 'button'; b.style.background = col; b.setAttribute('aria-label', `${key} ${i+1}`); b.className = draft.look[key] === i ? 'on' : ''; b.onclick = () => { draft.look[key] = i; renderCreate(); }; return b; }));
  sw($('c-skin'), SKINS, 'skin'); sw($('c-hcol'), HAIR_COLORS, 'hairColor'); sw($('c-eyes'), EYES, 'eyes');
  $('c-hair').replaceChildren(...HAIR_STYLES.map((n, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = n; b.className = draft.look.hair === i ? 'on' : ''; b.onclick = () => { draft.look.hair = i; renderCreate(); }; return b; }));
}
function startCreate() { draft = {nom:'', classe:'chevalier', look:{skin:1, hair:0, hairColor:1, eyes:1}}; $('c-name').value = ''; $('create').hidden = false; renderCreate(); }
$('c-go').onclick = () => { draft.nom = $('c-name').value; const res = request('create', draft); if (res) { $('create').hidden = true; tab('perso'); toast(`Bienvenue, ${state.nom} ! Tu as 3 boosters pour démarrer.`); } };

function render() {
  $('balance').textContent = fmt(state.jetons);
  if (!state.created) return;
  renderPerso(); renderPacks(); renderCollection(); renderShop(); renderProfile();
}
state = load(); if (!state.created) startCreate(); render();
setInterval(() => { if (state.created && !busy) renderReserve(); }, 1000);
