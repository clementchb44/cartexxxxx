// ===== ÉQUIPEMENT : données + dessin des pièces (SVG) =====
// Chaque pièce est dessinée dans le repère du personnage (200 x 300). Plus la rareté monte, plus la pièce est stylée.
export const RAR_KEYS = ['brut','aguerri','enchante','legendaire','mythique','celeste'];
export const RARETES = {
  brut:       {label:'Brut',       chance:52,  vente:.03, puissance:1,   couleur:'#b3a798', suffixe:"d’Écuyer"},
  aguerri:    {label:'Aguerri',    chance:26,  vente:.1,  puissance:3,   couleur:'#6fb7ff', suffixe:'de Garde'},
  enchante:   {label:'Enchanté',   chance:13,  vente:.3,  puissance:8,   couleur:'#c36bff', suffixe:'des Runes'},
  legendaire: {label:'Légendaire', chance:6.5, vente:1,   puissance:20,  couleur:'#ffcf3d', suffixe:'du Roi-Soleil'},
  mythique:   {label:'Mythique',   chance:2,   vente:3,   puissance:50,  couleur:'#ff4a4a', suffixe:'des Abysses ardents'},
  celeste:    {label:'Céleste',    chance:.5,  vente:8,   puissance:120, couleur:'#8ffff0', suffixe:'des Étoiles'},
};
const PAL = {
  brut:       {a:'#b9ae9f', b:'#5a524a', t:'#8a7d6c', g:'#b58b5a'},
  aguerri:    {a:'#cfe8ff', b:'#3f6fae', t:'#f1f8ff', g:'#5ec2ff'},
  enchante:   {a:'#e2b8ff', b:'#5f2aa8', t:'#ff9cf2', g:'#ff4fd8'},
  legendaire: {a:'#fff3a8', b:'#bf7d0c', t:'#fffbe0', g:'#ff7a1a'},
  mythique:   {a:'#ff9a88', b:'#6e0c1c', t:'#ffd9a0', g:'#ff3b3b'},
  celeste:    {a:'#ffffff', b:'#79d3ff', t:'#fff3a0', g:'#8ffff0'},
};
// Dégradés partagés (à insérer une fois dans la page)
export const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${RAR_KEYS.map(k=>{const p=PAL[k];return `<linearGradient id="m-${k}" x1="0" y1="0" x2=".8" y2="1">${k==='celeste'?`<stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#bff3ff"/><stop offset=".65" stop-color="#e2cdff"/><stop offset="1" stop-color="#ffe3f6"/>`:`<stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}"/>`}</linearGradient><radialGradient id="o-${k}"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${p.g}"/><stop offset="1" stop-color="${p.b}"/></radialGradient>`;}).join('')}<pattern id="chain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.6" fill="none" stroke="#0006" stroke-width="1"/></pattern><pattern id="scales" width="9" height="8" patternUnits="userSpaceOnUse"><path d="M0 4 Q4.5 10 9 4" fill="none" stroke="#0007" stroke-width="1.2"/></pattern></defs></svg>`;

export const SLOTS = [
  {id:'ailes',      nom:'Ailes',      icone:'🪽', z:-40, box:'0 40 200 200'},
  {id:'cape',       nom:'Cape',       icone:'🧣', z:-24, box:'40 80 120 190'},
  {id:'jambieres',  nom:'Jambières',  icone:'👖', z:4,   box:'55 160 90 100'},
  {id:'bottes',     nom:'Bottes',     icone:'👢', z:7,   box:'50 215 100 60'},
  {id:'plastron',   nom:'Plastron',   icone:'🛡️', z:12,  box:'40 82 120 100'},
  {id:'casque',     nom:'Casque',     icone:'🪖', z:20,  box:'35 0 130 100'},
  {id:'bouclier',   nom:'Seconde main',icone:'🔰', z:26, box:'8 96 108 140'},
  {id:'arme',       nom:'Arme',       icone:'⚔️', z:32,  box:'98 12 84 196'},
];
export const SLOT_BY = Object.fromEntries(SLOTS.map(s=>[s.id,s]));
export const VARIANTS = {
  ailes:     ['Ailes d’ange','Ailes de dragon','Ailes de papillon','Ailes de fée','Ailes mécaniques','Ailes de flammes'],
  cape:      ['Cape courte','Grande cape','Manteau de fourrure','Cape étoilée','Cape en lambeaux','Manteau royal'],
  jambieres: ['Jambières de plates','Jupe de robe','Pantalon de cuir','Chausses de mailles','Jambières d’écailles','Chausses bicolores'],
  bottes:    ['Bottes hautes','Sabatons','Bottes lacées','Bottes ailées','Bottes à éperons','Bottes de mage'],
  plastron:  ['Plastron de plates','Robe brodée','Veste de cuir','Tunique royale','Cotte de mailles','Armure de dragon'],
  casque:    ['Heaume','Capuche','Chapeau pointu','Couronne','Casque ailé','Casque à cornes'],
  bouclier:  ['Bouclier rond','Écu','Pavois','Grimoire','Lanterne magique','Orbe flottant'],
  arme:      ['Épée','Hache','Bâton','Arc','Dague','Marteau'],
};
const mirror = s => `<g>${s}</g><g transform="translate(200 0) scale(-1 1)">${s}</g>`;
const SK = 'stroke="#1b1230" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
const gem = (x,y,r,p) => `<g class="gem"><circle cx="${x}" cy="${y}" r="${r}" fill="${p.g}" stroke="#1b1230" stroke-width="1.4"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.35}" fill="#fff" opacity=".8"/></g>`;
const gems = (list,p) => p.lvl>=2 ? list.slice(0,p.lvl>=4?list.length:p.lvl>=3?2:1).map(([x,y,r])=>gem(x,y,r,p)).join('') : '';
const cracks = (d,p) => p.lvl===0 ? `<path d="${d}" fill="none" stroke="#0007" stroke-width="1.3"/>` : '';
const sparkle = (x,y,s,p) => p.lvl>=5 ? `<path class="spk" d="M${x} ${y-s}L${x+s*.3} ${y-s*.3}L${x+s} ${y}L${x+s*.3} ${y+s*.3}L${x} ${y+s}L${x-s*.3} ${y+s*.3}L${x-s} ${y}L${x-s*.3} ${y-s*.3}Z" fill="#fff" stroke="none"/>` : '';

const DRAW = {
// ---- CASQUES ----
casque: [
 (p)=>`<path d="M68 66 Q68 30 100 30 Q132 30 132 66 L132 84 Q132 90 126 90 L74 90 Q68 90 68 84Z" fill="${p.m}" ${SK}/><rect x="73" y="62" width="54" height="9" rx="3" fill="#0d0a18"/><rect x="97" y="62" width="6" height="28" fill="${p.m}" ${SK}/><path d="M100 30 Q${p.lvl>=3?64:90} ${p.lvl>=3?4:14} ${p.lvl>=3?60:76} 22 Q92 24 97 36Z" fill="${p.t}" ${SK}/>${gems([[100,44,4]],p)}${cracks('M80 40 L88 52 M118 38 L112 50',p)}`,
 (p)=>`<path fill-rule="evenodd" d="M66 70 Q62 28 100 24 Q138 28 134 70 Q134 94 120 96 L80 96 Q66 94 66 70Z M81 64 Q81 43 100 43 Q119 43 119 64 Q119 86 100 86 Q81 86 81 64Z" fill="${p.m}" ${SK}/><path d="M72 40 Q100 20 128 40" fill="none" stroke="${p.t}" stroke-width="3"/>${gems([[100,34,4]],p)}`,
 (p)=>`<ellipse cx="100" cy="44" rx="46" ry="10" fill="${p.m}" ${SK}/><path d="M72 44 Q84 42 90 18 Q98 2 120 8 Q104 16 112 44Z" fill="${p.m}" ${SK}/><path d="M73 40 Q100 48 113 40" fill="none" stroke="${p.t}" stroke-width="5"/>${gems([[94,41,4],[78,44,3]],p)}${p.lvl>=3?`<circle cx="116" cy="12" r="4" fill="${p.g}" stroke="#1b1230" stroke-width="1.2"/>`:''}${sparkle(124,8,6,p)}`,
 (p)=>`<path d="M70 46 L72 22 L86 36 L100 14 L114 36 L128 22 L130 46Z" fill="${p.m}" ${SK}/><rect x="70" y="42" width="60" height="9" rx="3" fill="${p.t}" ${SK}/>${gems([[100,24,4],[76,32,3],[124,32,3]],p)}${sparkle(100,8,6,p)}`,
 (p)=>`<path d="M68 62 Q68 30 100 30 Q132 30 132 62 L132 72 L68 72Z" fill="${p.m}" ${SK}/><rect x="72" y="54" width="56" height="8" rx="3" fill="#0d0a18" opacity=".85"/>${mirror(`<path d="M68 50 Q40 46 26 18 Q50 20 70 38Z" fill="${p.t}" ${SK}/><path d="M66 56 Q44 56 34 36" fill="none" stroke="${p.b}" stroke-width="2"/>`)}${gems([[100,40,4]],p)}`,
 (p)=>`<path d="M68 62 Q68 32 100 32 Q132 32 132 62 L132 72 L68 72Z" fill="${p.m}" ${SK}/><path d="M80 70 L80 88 Q100 96 120 88 L120 70Z" fill="${p.m}" ${SK}/><rect x="76" y="56" width="48" height="8" rx="3" fill="#0d0a18" opacity=".85"/>${mirror(`<path d="M68 50 Q46 52 42 24 Q50 8 54 4 Q54 28 72 40Z" fill="${p.t}" ${SK}/>`)}${gems([[100,42,4]],p)}`,
],
// ---- PLASTRONS ----
plastron: [
 (p)=>`<path d="M74 96 Q100 88 126 96 L129 166 L71 166Z" fill="${p.m}" ${SK}/><path d="M100 94 L100 166" stroke="${p.t}" stroke-width="2.5"/><path d="M80 118 Q100 130 120 118" fill="none" stroke="${p.t}" stroke-width="2"/>${mirror(`<circle cx="70" cy="102" r="14" fill="${p.m}" ${SK}/><circle cx="70" cy="102" r="14" fill="none" stroke="${p.t}" stroke-width="2" stroke-dasharray="3 4"/>`)}<rect x="71" y="158" width="58" height="9" rx="2" fill="${p.t}" ${SK}/>${gems([[100,132,5],[70,102,4],[130,102,4]],p)}${cracks('M84 110 L92 126 L86 140',p)}`,
 (p)=>`<path d="M76 96 Q100 90 124 96 L130 166 L70 166Z" fill="${p.m}" ${SK}/>${mirror(`<path d="M72 98 L60 104 L56 166 L70 166Z" fill="${p.m}" ${SK}/><path d="M56 160 L70 160" stroke="${p.t}" stroke-width="5"/>`)}<path d="M88 94 L100 124 L112 94" fill="${p.t}" ${SK}/><rect x="70" y="146" width="60" height="9" rx="3" fill="${p.t}" ${SK}/>${gems([[100,150,4]],p)}`,
 (p)=>`<path d="M75 96 Q100 90 125 96 L128 166 L72 166Z" fill="${p.m}" ${SK}/>${mirror(`<path d="M76 96 L82 166" stroke="${p.t}" stroke-width="4"/>`)}<path d="M86 112 L114 130 M114 112 L86 130 M86 134 L114 152 M114 134 L86 152" stroke="${p.t}" stroke-width="2.2"/><rect x="72" y="158" width="56" height="8" fill="${p.b}" ${SK}/>${gems([[100,162,4]],p)}`,
 (p)=>`<path d="M74 96 Q100 90 126 96 L129 166 L71 166Z" fill="${p.m}" ${SK}/>${mirror(`<ellipse cx="70" cy="100" rx="14" ry="8" fill="${p.t}" ${SK}/><path d="M60 104 L58 116 M66 106 L64 118 M72 107 L70 119" stroke="${p.t}" stroke-width="2.5"/>`)}<path d="M100 112 l5 10 11 1 -8 8 2 11 -10-6 -10 6 2-11 -8-8 11-1z" fill="${p.t}" ${SK}/><path d="M84 94 L100 108 L116 94" fill="none" stroke="${p.t}" stroke-width="3"/>${gems([[100,128,4]],p)}`,
 (p)=>`<path d="M74 96 Q100 90 126 96 L129 166 L71 166Z" fill="${p.m}" ${SK}/><path d="M74 96 Q100 90 126 96 L129 166 L71 166Z" fill="url(#chain)"/>${mirror(`<path d="M72 98 L60 104 L58 150 L70 150Z" fill="${p.m}" ${SK}/><path d="M72 98 L60 104 L58 150 L70 150Z" fill="url(#chain)"/>`)}<path d="M74 164 L126 164" stroke="${p.t}" stroke-width="5"/>${gems([[100,150,4]],p)}`,
 (p)=>`<path d="M74 96 Q100 90 126 96 L129 166 L71 166Z" fill="${p.m}" ${SK}/><path d="M74 96 Q100 90 126 96 L129 166 L71 166Z" fill="url(#scales)"/>${mirror(`<path d="M58 106 L64 84 L76 98 L84 90 L82 104Z" fill="${p.t}" ${SK}/><circle cx="68" cy="104" r="12" fill="${p.m}" ${SK}/>`)}<path d="M92 94 L100 108 L108 94" fill="${p.t}" ${SK}/>${gems([[100,130,5],[100,150,3]],p)}${sparkle(130,98,6,p)}`,
],
// ---- JAMBIÈRES ----
jambieres: [
 (p)=>`${mirror(`<path d="M80 166 L99 166 L97 248 L81 248Z" fill="${p.m}" ${SK}/><ellipse cx="89" cy="206" rx="9" ry="8" fill="${p.t}" ${SK}/>`)}${gems([[89,206,3],[111,206,3]],p)}${cracks('M84 180 L90 196',p)}`,
 (p)=>`<path d="M76 164 L124 164 L138 246 L62 246Z" fill="${p.m}" ${SK}/><path d="M62 238 L138 238" stroke="${p.t}" stroke-width="5"/><path d="M100 166 L100 244" stroke="${p.b}" stroke-width="2"/>${gems([[100,172,4]],p)}`,
 (p)=>`${mirror(`<path d="M80 166 L99 166 L97 248 L81 248Z" fill="${p.m}" ${SK}/><rect x="80" y="190" width="18" height="6" fill="${p.t}"/><rect x="81" y="222" width="16" height="6" fill="${p.t}"/>`)}<rect x="78" y="164" width="44" height="8" fill="${p.b}" ${SK}/>${gems([[100,168,3]],p)}`,
 (p)=>`${mirror(`<path d="M80 166 L99 166 L97 248 L81 248Z" fill="${p.m}" ${SK}/><path d="M80 166 L99 166 L97 248 L81 248Z" fill="url(#chain)"/>`)}<rect x="78" y="164" width="44" height="7" fill="${p.t}" ${SK}/>${gems([[100,168,3]],p)}`,
 (p)=>`${mirror(`<path d="M80 166 L99 166 L97 248 L81 248Z" fill="${p.m}" ${SK}/><path d="M80 166 L99 166 L97 248 L81 248Z" fill="url(#scales)"/><path d="M78 200 L72 212 L84 208Z" fill="${p.t}" ${SK}/>`)}${gems([[100,170,4]],p)}${sparkle(112,200,5,p)}`,
 (p)=>`<path d="M80 166 L99 166 L97 248 L81 248Z" fill="${p.m}" ${SK}/><path d="M101 166 L120 166 L119 248 L103 248Z" fill="${p.t}" ${SK}/><rect x="78" y="164" width="44" height="8" fill="${p.b}" ${SK}/><rect x="80" y="222" width="18" height="5" fill="${p.b}"/><rect x="102" y="222" width="18" height="5" fill="${p.m}"/>${gems([[100,168,3]],p)}`,
],
// ---- BOTTES (une botte, miroir pour la paire) ----
bottes: [
 (p)=>mirror(`<path d="M80 226 L99 226 L99 262 L72 264 Q70 254 80 250Z" fill="${p.m}" ${SK}/><rect x="79" y="224" width="21" height="8" rx="2" fill="${p.t}" ${SK}/>`)+gems([[89,240,3],[111,240,3]],p),
 (p)=>mirror(`<path d="M80 238 L99 238 L99 258 L96 264 L62 266 L76 250Z" fill="${p.m}" ${SK}/><path d="M80 238 L99 238" stroke="${p.t}" stroke-width="5"/>`)+gems([[88,246,3],[112,246,3]],p),
 (p)=>mirror(`<path d="M80 228 L99 228 L99 262 L72 264 Q70 254 80 250Z" fill="${p.m}" ${SK}/><path d="M82 234 L97 238 M82 241 L97 245 M82 248 L96 252" stroke="${p.t}" stroke-width="2"/>`),
 (p)=>mirror(`<path d="M80 236 L99 236 L99 262 L72 264 Q70 254 80 250Z" fill="${p.m}" ${SK}/><path d="M80 242 Q60 224 52 236 Q62 242 79 250Z" fill="${p.t}" ${SK}/><path d="M80 246 Q64 238 58 246 Q66 248 79 254Z" fill="${p.t}" ${SK}/>`)+sparkle(52,230,6,p),
 (p)=>mirror(`<path d="M80 230 L99 230 L99 262 L72 264 Q70 254 80 250Z" fill="${p.m}" ${SK}/><circle cx="102" cy="258" r="5" fill="${p.t}" ${SK}/><path d="M79 230 L99 230" stroke="${p.t}" stroke-width="5"/>`)+gems([[89,242,3]],p),
 (p)=>mirror(`<path d="M80 236 L99 236 L99 258 L78 262 Q62 268 60 254 Q70 254 74 248Z" fill="${p.m}" ${SK}/><path d="M80 238 L99 238" stroke="${p.t}" stroke-width="5"/>`)+gems([[89,247,3]],p),
],
// ---- ARMES (main droite, à x≈136) ----
arme: [
 (p)=>`<path d="M136 52 L143 70 L143 148 L129 148 L129 70Z" fill="${p.m}" ${SK}/><path d="M136 58 L136 146" stroke="${p.t}" stroke-width="2"/><rect x="120" y="146" width="32" height="8" rx="3" fill="${p.t}" ${SK}/><rect x="132" y="154" width="8" height="24" fill="#5a3a20" ${SK}/><circle cx="136" cy="182" r="6" fill="${p.t}" ${SK}/>${gems([[136,150,4],[124,150,3],[148,150,3]],p)}${cracks('M133 80 L138 96 M139 112 L133 126',p)}${sparkle(150,70,6,p)}`,
 (p)=>`<rect x="133" y="56" width="7" height="128" rx="2" fill="#6b4425" ${SK}/><path d="M140 62 Q172 50 176 92 Q154 100 140 94Z" fill="${p.m}" ${SK}/><path d="M133 66 Q106 62 104 82 Q120 88 133 84Z" fill="${p.m}" ${SK}/><path d="M144 70 Q164 66 168 88" fill="none" stroke="${p.t}" stroke-width="2.5"/><rect x="131" y="104" width="11" height="5" fill="${p.t}"/>${gems([[137,74,4]],p)}${sparkle(176,56,6,p)}`,
 (p)=>`<rect x="133" y="40" width="7" height="146" rx="3" fill="#6b4425" ${SK}/><path d="M122 36 Q124 18 136 16 Q148 18 150 36" fill="none" stroke="${p.t}" stroke-width="4"/><circle cx="136" cy="30" r="${p.lvl>=3?15:12}" fill="url(#o-${p.k})" ${SK} class="orb"/><rect x="131" y="108" width="11" height="6" fill="${p.t}"/>${gems([[136,60,3]],p)}${sparkle(158,16,7,p)}`,
 (p)=>`<path d="M138 70 Q184 140 138 214" fill="none" stroke="#1b1230" stroke-width="10" stroke-linecap="round"/><path d="M138 70 Q184 140 138 214" fill="none" stroke="${p.m}" stroke-width="6" stroke-linecap="round"/><path d="M138 70 L138 214" stroke="${p.lvl>=2?p.t:'#e9e0d0'}" stroke-width="1.6"/><rect x="134" y="136" width="9" height="22" rx="3" fill="${p.t}" ${SK}/>${gems([[150,108,3],[150,176,3]],p)}${sparkle(168,140,6,p)}`,
 (p)=>`<path d="M136 118 L142 128 L142 156 L130 156 L130 128Z" fill="${p.m}" ${SK}/><rect x="122" y="154" width="28" height="6" rx="3" fill="${p.t}" ${SK}/><rect x="132" y="160" width="8" height="18" fill="#5a3a20" ${SK}/><circle cx="136" cy="181" r="5" fill="${p.t}" ${SK}/>${gems([[136,157,3]],p)}${sparkle(150,128,5,p)}`,
 (p)=>`<rect x="133" y="62" width="7" height="122" rx="2" fill="#6b4425" ${SK}/><rect x="112" y="48" width="48" height="30" rx="5" fill="${p.m}" ${SK}/><rect x="112" y="58" width="48" height="6" fill="${p.t}"/><path d="M112 48 L104 56 L112 78Z M160 48 L168 56 L160 78Z" fill="${p.t}" ${SK}/>${gems([[136,56,4]],p)}${sparkle(166,44,6,p)}`,
],
// ---- SECONDE MAIN (main gauche, à x≈64) ----
bouclier: [
 (p)=>`<circle cx="46" cy="152" r="32" fill="${p.m}" ${SK}/><circle cx="46" cy="152" r="26" fill="none" stroke="${p.t}" stroke-width="3" stroke-dasharray="4 4"/><circle cx="46" cy="152" r="9" fill="${p.t}" ${SK}/>${gems([[46,152,5],[46,126,3],[46,178,3]],p)}${cracks('M28 138 L38 150 L32 164',p)}`,
 (p)=>`<path d="M18 116 L76 116 L76 150 Q76 186 47 202 Q18 186 18 150Z" fill="${p.m}" ${SK}/><path d="M47 118 L47 198 M20 142 L74 142" stroke="${p.t}" stroke-width="4"/>${gems([[47,142,5],[30,128,3],[64,128,3]],p)}${sparkle(74,118,6,p)}`,
 (p)=>`<rect x="16" y="96" width="52" height="102" rx="8" fill="${p.m}" ${SK}/><rect x="22" y="102" width="40" height="90" rx="5" fill="none" stroke="${p.t}" stroke-width="3"/><path d="M42 102 L42 192" stroke="${p.t}" stroke-width="3"/><circle cx="26" cy="108" r="3" fill="${p.t}"/><circle cx="58" cy="108" r="3" fill="${p.t}"/><circle cx="26" cy="186" r="3" fill="${p.t}"/><circle cx="58" cy="186" r="3" fill="${p.t}"/>${gems([[42,148,6],[42,120,3]],p)}`,
 (p)=>`<g transform="rotate(-10 44 160)"><rect x="20" y="130" width="46" height="60" rx="4" fill="${p.m}" ${SK}/><rect x="26" y="136" width="34" height="48" rx="2" fill="#f6efd8" opacity=".25"/><circle cx="43" cy="160" r="11" fill="none" stroke="${p.t}" stroke-width="2.5"/><path d="M43 150 L43 170 M33 160 L53 160" stroke="${p.t}" stroke-width="2"/><rect x="62" y="132" width="5" height="56" fill="#f6efd8" stroke="#1b1230" stroke-width="1.5"/></g>${gems([[43,160,4]],p)}${sparkle(66,128,6,p)}`,
 (p)=>`<path d="M64 168 Q58 190 50 196" fill="none" stroke="${p.t}" stroke-width="3"/><path d="M38 198 L62 198 L58 190 L42 190Z" fill="${p.m}" ${SK}/><rect x="40" y="198" width="20" height="26" rx="6" fill="${p.g}" opacity=".85" ${SK} class="lamp"/><rect x="36" y="222" width="28" height="6" rx="2" fill="${p.m}" ${SK}/><path d="M50 190 L50 182" stroke="${p.t}" stroke-width="3"/>${sparkle(30,200,6,p)}`,
 (p)=>`<circle cx="46" cy="142" r="22" fill="url(#o-${p.k})" ${SK} class="orb"/><ellipse cx="46" cy="170" rx="20" ry="5" fill="${p.m}" ${SK}/><path d="M32 128 Q40 122 48 124" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>${gems([[46,172,3]],p)}${sparkle(24,124,6,p)}`,
],
// ---- AILES (derrière, symétriques) ----
ailes: [
 (p)=>mirror(`<path d="M124 108 Q168 34 196 62 Q194 92 184 112 Q192 142 168 164 Q150 144 132 148Z" fill="${p.m}" ${SK}/><path d="M138 112 Q164 80 184 70 M140 124 Q170 104 188 100 M140 136 Q164 128 180 134" fill="none" stroke="${p.t}" stroke-width="2.2"/>`)+sparkle(186,50,7,p),
 (p)=>mirror(`<path d="M124 106 L168 30 L178 70 L196 90 L172 104 L184 144 L152 126 L158 168 L128 130Z" fill="${p.m}" ${SK}/><path d="M124 106 L168 30 M126 112 L196 90 M128 120 L184 144 M128 126 L158 168" fill="none" stroke="${p.t}" stroke-width="2.4"/>`)+sparkle(170,26,7,p),
 (p)=>mirror(`<path d="M124 112 Q172 22 196 74 Q190 112 130 122Z" fill="${p.m}" ${SK}/><path d="M128 124 Q180 126 178 174 Q150 190 128 140Z" fill="${p.m}" ${SK}/><circle cx="170" cy="70" r="9" fill="${p.t}" opacity=".9"/><circle cx="156" cy="156" r="6" fill="${p.t}" opacity=".9"/><circle cx="182" cy="92" r="4" fill="${p.t}" opacity=".9"/>`)+sparkle(190,56,7,p),
 (p)=>mirror(`<ellipse cx="160" cy="84" rx="40" ry="14" transform="rotate(-34 160 84)" fill="${p.m}" opacity=".72" stroke="${p.t}" stroke-width="2"/><ellipse cx="156" cy="132" rx="32" ry="11" transform="rotate(22 156 132)" fill="${p.m}" opacity=".72" stroke="${p.t}" stroke-width="2"/>`)+sparkle(188,56,7,p),
 (p)=>mirror(`<g transform="rotate(-62 124 112)"><rect x="124" y="104" width="76" height="12" rx="5" fill="${p.m}" ${SK}/></g><g transform="rotate(-32 124 112)"><rect x="124" y="104" width="84" height="12" rx="5" fill="${p.m}" ${SK}/></g><g transform="rotate(0 124 112)"><rect x="124" y="104" width="80" height="12" rx="5" fill="${p.m}" ${SK}/></g><g transform="rotate(32 124 112)"><rect x="124" y="104" width="68" height="12" rx="5" fill="${p.m}" ${SK}/></g><circle cx="136" cy="112" r="10" fill="${p.t}" ${SK}/>`)+sparkle(190,52,7,p),
 (p)=>mirror(`<path d="M124 112 Q150 60 164 24 Q168 56 178 38 Q184 74 196 68 Q190 104 172 120 Q184 140 160 158 Q150 140 128 132Z" fill="${p.m}" ${SK}/><path d="M136 122 Q158 96 170 62 Q170 96 160 128Z" fill="${p.t}" opacity=".85"/>`)+sparkle(176,24,7,p),
],
// ---- CAPES (derrière le corps) ----
cape: [
 (p)=>`<path d="M74 94 L126 94 L138 192 Q100 202 62 192Z" fill="${p.m}" ${SK}/><path d="M62 192 Q100 202 138 192" fill="none" stroke="${p.t}" stroke-width="4"/>`,
 (p)=>`<path d="M74 94 L126 94 L148 260 Q100 272 52 260Z" fill="${p.m}" ${SK}/><path d="M52 260 Q100 272 148 260" fill="none" stroke="${p.t}" stroke-width="5"/><path d="M100 100 L100 264" stroke="${p.b}" stroke-width="2" opacity=".6"/>`,
 (p)=>`<path d="M72 94 L128 94 L142 230 Q100 242 58 230Z" fill="${p.m}" ${SK}/>${[...Array(8)].map((_,i)=>`<circle cx="${60+i*11.5}" cy="${232+(i%2)*4}" r="9" fill="${p.lvl>=3?p.t:'#efe7d8'}" ${SK}/>`).join('')}${[...Array(6)].map((_,i)=>`<circle cx="${74+i*10.4}" cy="96" r="8" fill="${p.lvl>=3?p.t:'#efe7d8'}" ${SK}/>`).join('')}`,
 (p)=>`<path d="M72 94 L128 94 L144 244 L100 234 L56 244Z" fill="${p.m}" ${SK}/>${mirror(`<path d="M70 96 L62 66 L84 92Z" fill="${p.m}" ${SK}/>`)}<circle cx="82" cy="140" r="3" fill="${p.t}"/><circle cx="118" cy="170" r="3.5" fill="${p.t}"/><circle cx="96" cy="206" r="3" fill="${p.t}"/><circle cx="124" cy="216" r="2.5" fill="${p.t}"/><circle cx="76" cy="188" r="2.5" fill="${p.t}"/>`+sparkle(110,150,6,p),
 (p)=>`<path d="M74 94 L126 94 L146 236 L136 250 L126 234 L116 256 L104 236 L92 258 L80 236 L66 252 L58 234Z" fill="${p.m}" ${SK}/><path d="M92 120 L88 150 M112 130 L116 166" stroke="#0006" stroke-width="1.5"/>`,
 (p)=>`<path d="M74 94 L126 94 L148 250 Q100 266 52 250Z" fill="${p.m}" ${SK}/><path d="M56 236 Q100 252 144 236 L148 250 Q100 266 52 250Z" fill="#f5f0e6" ${SK}/>${[0,1,2,3,4,5].map(i=>`<circle cx="${66+i*14}" cy="${248+(i%2)*3}" r="2.2" fill="#1b1230"/>`).join('')}${mirror(`<path d="M72 96 L64 76 L86 94Z" fill="${p.t}" ${SK}/>`)}`,
],
};

// ---- Liste des cartes d'équipement ----
export const ITEMS = [];
SLOTS.forEach((s, si) => VARIANTS[s.id].forEach((vn, vi) => RAR_KEYS.forEach((rk, ri) => {
  ITEMS.push({id: 1000 + si*100 + vi*10 + ri, slot: s.id, variant: vi, rarete: rk, nom: `${vn} ${RARETES[rk].suffixe}`, base: vn, puissance: RARETES[rk].puissance});
})));
export const ITEM_BY = new Map(ITEMS.map(i => [i.id, i]));

// Dessine une pièce (SVG interne, repère 200x300)
export function drawPiece(item) {
  const k = item.rarete, lvl = RAR_KEYS.indexOf(k), pal = PAL[k];
  const p = {m:`url(#m-${k})`, a:pal.a, b:pal.b, t:pal.t, g:pal.g, lvl, k};
  return DRAW[item.slot][item.variant](p);
}
// SVG complet de la pièce, recadré pour une carte
export function pieceSvg(item) {
  const s = SLOT_BY[item.slot];
  return `<svg viewBox="${s.box}" class="piece lvl${RAR_KEYS.indexOf(item.rarete)} r-${item.rarete}" role="img" aria-label="${item.nom}">${drawPiece(item)}</svg>`;
}

// ---- Personnage ----
export const CLASSES = {
  chevalier: {nom:'Chevalier', icone:'🛡️', couleur:'#4a78c9', perk:'Ventes +15 % de jetons', desc:'Solide et fiable : tes doublons se revendent mieux.'},
  mage:      {nom:'Mage',      icone:'🔮', couleur:'#8a52d6', perk:'XP +10 %',              desc:'Savant et curieux : tu progresses plus vite.'},
  archer:    {nom:'Archer',    icone:'🏹', couleur:'#3f9a5a', perk:'Boosters 10 % plus rapides', desc:'Vif et précis : tes boosters arrivent plus tôt.'},
  voleur:    {nom:'Voleur',    icone:'🗡️', couleur:'#5b5b6e', perk:'Récompense du jour +25 %', desc:'Malin et discret : les cadeaux quotidiens sont plus gros.'},
};
export const SKINS = ['#ffe0c7','#f6c9a0','#d9a273','#b87a4d','#8a5632','#5e3a22'];
export const HAIR_COLORS = ['#2a1b12','#6b3d1e','#c98a3a','#f1d36a','#d0452f','#7d4bd6','#3f8fd6','#e8e8ee'];
export const HAIR_STYLES = ['Court','Long','Queue','Pointes','Chignon'];
export const EYES = ['#2a1b12','#2f6fd0','#2f9a5a','#8a52d6','#d0452f'];
const hairSvg = (st, c) => {
  const cap = `<path d="M69 58 Q70 28 100 27 Q130 28 131 58 Q118 42 100 44 Q82 42 69 58Z" fill="${c}" ${SK}/>`;
  return [cap,
    cap + `<path d="M69 58 Q64 90 70 112 L82 104 L80 62Z M131 58 Q136 90 130 112 L118 104 L120 62Z" fill="${c}" ${SK}/>`,
    cap + `<path d="M130 46 Q158 44 152 76 Q144 60 128 58Z" fill="${c}" ${SK}/>`,
    `<path d="M69 58 L66 36 L80 44 L84 22 L96 38 L104 18 L112 38 L124 22 L124 44 L134 34 L131 58 Q118 44 100 46 Q82 44 69 58Z" fill="${c}" ${SK}/>`,
    cap + `<circle cx="100" cy="22" r="11" fill="${c}" ${SK}/>`][st] || cap;
};
export function bodySvg(look, cls) {
  const skin = SKINS[look.skin] || SKINS[0], tunic = CLASSES[cls]?.couleur || '#4a78c9';
  const arm = `<path d="M70 98 L78 100 L74 160 L60 160Z" fill="${tunic}" ${SK}/><circle cx="64" cy="168" r="8" fill="${skin}" ${SK}/>`;
  return `<ellipse cx="100" cy="270" rx="46" ry="9" fill="#000" opacity=".28"/>
  <path d="M82 166 L99 166 L97 252 L83 252Z M101 166 L118 166 L117 252 L103 252Z" fill="#5a4636" ${SK}/>
  <path d="M82 250 L98 250 L98 262 L74 264 Q72 256 82 254Z M118 250 L102 250 L102 262 L126 264 Q128 256 118 254Z" fill="#3a2a22" ${SK}/>
  <path d="M75 96 Q100 90 125 96 L128 168 L72 168Z" fill="${tunic}" ${SK}/><rect x="72" y="158" width="56" height="8" fill="#3a2a22" ${SK}/>
  ${arm}<g transform="translate(200 0) scale(-1 1)">${arm}</g>
  <rect x="91" y="84" width="18" height="14" fill="${skin}" ${SK}/>
  <circle cx="100" cy="60" r="31" fill="${skin}" ${SK}/>
  <circle cx="88" cy="64" r="4.2" fill="${EYES[look.eyes]||EYES[0]}"/><circle cx="112" cy="64" r="4.2" fill="${EYES[look.eyes]||EYES[0]}"/><circle cx="86.8" cy="62.6" r="1.3" fill="#fff"/><circle cx="110.8" cy="62.6" r="1.3" fill="#fff"/>
  <path d="M92 76 Q100 82 108 76" fill="none" stroke="#1b1230" stroke-width="2.2" stroke-linecap="round"/><circle cx="80" cy="73" r="4" fill="#ff7a9a" opacity=".35"/><circle cx="120" cy="73" r="4" fill="#ff7a9a" opacity=".35"/>`;
}
const wrap = (inner, cls='') => `<svg viewBox="0 0 200 300" class="lay ${cls}" aria-hidden="true">${inner}</svg>`;
// Personnage en couches (chaque couche a une profondeur Z pour l'effet 3D)
export function characterHtml(state) {
  const eq = state.equipped || {}, layers = [];
  const item = s => ITEM_BY.get(eq[s]);
  const casque = item('casque');
  let maxLvl = -1;
  const add = (slot) => { const it = item(slot); if (!it) return; const l = RAR_KEYS.indexOf(it.rarete); maxLvl = Math.max(maxLvl, l);
    layers.push(`<div class="layer r-${it.rarete}" style="--z:${SLOT_BY[slot].z}px">${wrap(drawPiece(it), 'lvl'+l)}</div>`); };
  add('ailes'); add('cape');
  layers.push(`<div class="layer" style="--z:0px">${wrap(bodySvg(state.look, state.classe))}</div>`);
  add('jambieres'); add('bottes'); add('plastron');
  const showHair = !casque || casque.variant === 3;
  if (showHair) layers.push(`<div class="layer" style="--z:14px">${wrap(hairSvg(state.look.hair, HAIR_COLORS[state.look.hairColor]||HAIR_COLORS[0]))}</div>`);
  add('casque'); add('bouclier'); add('arme');
  const fx = maxLvl >= 3 ? `<div class="layer fx fx${maxLvl}" style="--z:44px">${[...Array(maxLvl>=5?14:8)].map((_,i)=>`<i style="--i:${i}"></i>`).join('')}</div>` : '';
  return `<div class="char-scene"><div class="char-3d">${layers.join('')}${fx}</div></div>`;
}
