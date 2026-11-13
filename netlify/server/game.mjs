import { CARTES, RARETES } from '../../public/catalog.mjs';
export const INTERVAL = 15*60*1000;
export function initial(now = Date.now(), legacy = {}) {
  const collection = {};
  for (const card of CARTES) {
    const count = legacy.collection?.[card.id];
    if (Number.isSafeInteger(count) && count > 0) collection[card.id] = Math.min(count, 100000);
  }
  const jetons = Number.isFinite(legacy.jetons) && legacy.jetons >= 0 ? Math.min(legacy.jetons, 100000) : 1;
  const oldDue = Number.isFinite(legacy.prochainJeton) ? legacy.prochainJeton : 0;
  return {collection,jetons,boosters:1,anchor:oldDue > 0 ? Math.min(now,oldDue-20*60*1000) : now};
}
export function accrue(state, now = Date.now()) {
  const elapsed = Math.max(0, Math.floor((now-state.anchor)/INTERVAL));
  if (state.boosters >= 10 || state.boosters+elapsed >= 10) { state.boosters=10; state.anchor=now; }
  else if (elapsed) { state.boosters+=elapsed; state.anchor+=elapsed*INTERVAL; }
  return state;
}
export function draw(random = Math.random) {
  let roll = random()*Object.values(RARETES).reduce((a,r)=>a+r.chance,0);
  for (const [key, rarity] of Object.entries(RARETES)) {
    roll-=rarity.chance;
    if (roll < 0) { const pool=CARTES.filter(c=>c.rarete===key); return pool[Math.floor(random()*pool.length)]; }
  }
  return CARTES.at(-1);
}
export const QUESTS = [
  {id:'packs',label:'Ouvrir 2 boosters',target:2,reward:0.5},
  {id:'cards',label:'Obtenir 10 cartes',target:10,reward:0.5},
  {id:'sell',label:'Vendre 3 doublons',target:3,reward:0.5},
];
export function daily(state, now) {
  const day = new Date(now).toISOString().slice(0,10);
  if (state.daily?.day !== day) state.daily = {day,progress:{packs:0,cards:0,sell:0},claimed:[]};
  return state.daily;
}
export function action(state, body, now=Date.now(), random=Math.random) {
  accrue(state,now);
  const quests=daily(state,now);
  const result={cards:[],message:''};
  const addCard=()=>{ const card=draw(random); result.cards.push({...card,new:!state.collection[card.id]}); state.collection[card.id]=(state.collection[card.id]||0)+1; quests.progress.cards=Math.min(10,quests.progress.cards+1); };
  if (body.action==='open') {
    if(state.boosters>0) state.boosters--; else if(state.jetons>=1) state.jetons=Math.round((state.jetons-1)*100)/100; else throw Error('Aucun booster ni jeton disponible.');
    for(let i=0;i<5;i++) addCard();
    quests.progress.packs=Math.min(2,quests.progress.packs+1);
    result.message='Cinq nouvelles découvertes.';
  } else if(body.action==='sell') {
    let sold=0;
    for(const card of CARTES) if(body.id===undefined || body.id===card.id) { const n=Math.max(0,(state.collection[card.id]||0)-1); if(n){ state.collection[card.id]=1; sold+=n; } }
    state.jetons=Math.round((state.jetons+sold*0.05)*100)/100;
    quests.progress.sell=Math.min(3,quests.progress.sell+sold);
    result.message=`${sold} doublon(s) vendu(s).`;
  } else if(body.action==='casino') {
    const bet=body.bet;
    if(![0.25,0.5,1,2,5].includes(bet)) throw Error('Choisis une mise proposée.');
    if(state.jetons<bet) throw Error('Pas assez de jetons pour cette mise.');
    state.jetons=Math.round((state.jetons-bet)*100)/100;
    const roll=random();
    if(roll<0.10) { state.jetons+=bet*5; result.message=`Jackpot ! ${bet*5} jetons gagnés.`; result.symbols=['✦','✦','✦']; }
    else if(roll<0.35) { state.jetons+=bet*2; result.message=`${bet*2} jeton(s) gagnés !`; result.symbols=['◈','◈','◈']; }
    else if(roll<0.50) { addCard(); result.message='Une carte rejoint ta collection !'; result.symbols=['❖','❖','❖']; }
    else { result.message=`Cette fois, tu perds ta mise de ${bet} jeton(s).`; result.symbols=['✦','◈','❖']; }
    state.jetons=Math.round(state.jetons*100)/100;
  } else if(body.action==='claim') {
    const quest=QUESTS.find(q=>q.id===body.quest);
    if(!quest || quests.progress[quest.id]<quest.target || quests.claimed.includes(quest.id)) throw Error('Quête indisponible.');
    quests.claimed.push(quest.id);
    state.jetons=Math.round((state.jetons+quest.reward)*100)/100;
    result.message=`+${quest.reward} jeton : récompense récupérée !`;
  } else if(body.action!=='sync') throw Error('Action inconnue.');
  return {state,...result,quests:QUESTS,serverTime:now};
}
