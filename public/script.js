import { CARTES, RARETES } from './catalog.mjs';
const $=id=>document.getElementById(id);
const format=n=>n.toLocaleString('fr-FR',{maximumFractionDigits:2});
let state=null, busy=false, offset=0, initialized=false, questDefinitions=[];
const interval=900000;
function card(c,preview=false,isNew=false){
 const n=state?.collection[c.id]||0, locked=!preview&&!n;
 const image=CARTES.find(item=>item.id===c.id)?.image;
 const art=image?`<img src="${image}" alt="Illustration de ${c.nom}" width="240" height="180" loading="${preview?'eager':'lazy'}" decoding="async">`:(locked?'◇':c.emoji);
 const el=document.createElement('article'); el.className=`card ${c.rarete}${locked?' locked':''}`;
 el.style.setProperty('--accent',RARETES[c.rarete].couleur);
 el.innerHTML=`<div class="card-top"><span>${RARETES[c.rarete].label}</span><b>${c.pv} PV</b></div><div class="art">${art}</div><small>N° ${String(c.id).padStart(3,'0')}</small><h3>${c.nom}</h3><div class="card-bottom"><span>${locked?'À DÉCOUVRIR':isNew?'NOUVEAU':n?'× '+n:'APERÇU'}</span><span>✦</span></div>`;
 el.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.style.transform=`perspective(800px) rotateY(${(x-.5)*16}deg) rotateX(${(.5-y)*16}deg)`;el.style.setProperty('--shine',`${x*100}%`);});
 el.addEventListener('pointerleave',()=>el.style.transform='');return el;
}
function tab(name){document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('visible',el.id===name));document.querySelectorAll('[data-tab]').forEach(el=>{el.classList.toggle('active',el.dataset.tab===name);el.setAttribute('aria-current',el.dataset.tab===name?'page':'false');});}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>tab(b.dataset.tab));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>tab(b.dataset.go));
function timer(){if(!state)return;const now=Date.now()+offset;const added=Math.max(0,Math.floor((now-state.anchor)/interval));const reserve=Math.min(10,state.boosters+added);$('reserve').textContent=`${reserve} / 10 boosters`;$('open').textContent=reserve?'Ouvrir un booster ↗':'Ouvrir pour 1 jeton ↗';$('open').disabled=busy||(!reserve&&state.jetons<1);$('play').disabled=busy||state.jetons<Number($('bet').value);$('reserve-track').innerHTML=Array.from({length:10},(_,i)=>`<i class="${i<reserve?'filled':''}"></i>`).join('');const left=Math.max(0,Math.ceil((interval-((now-state.anchor)%interval))/1000));$('timer').textContent=reserve===10?'Réserve pleine':`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;}
function render(){ $('balance').textContent=format(state.jetons);$('count').textContent=`${CARTES.filter(c=>state.collection[c.id]>0).length} / ${CARTES.length} cartes découvertes`;$('sell').disabled=busy||!Object.values(state.collection).some(n=>n>1);renderCollection();renderQuests();$('crystal-cards').replaceChildren(...CARTES.filter(c=>c.rarete==='cristal').map(c=>card(c,true)));timer(); }
function renderCollection(){if(!state)return;const query=$('search').value.toLocaleLowerCase('fr'),rarity=$('rarity').value,owned=$('owned').checked;const zone=$('cards');zone.replaceChildren();let found=0;for(const key of ['cristal','mythique','legendaire','epique','rare','commun']){if(rarity&&rarity!==key)continue;const list=CARTES.filter(c=>c.rarete===key&&c.nom.toLocaleLowerCase('fr').includes(query)&&(!owned||state.collection[c.id]>0));if(!list.length)continue;found+=list.length;const heading=document.createElement('h2');heading.className='rarity-heading';heading.textContent=`${RARETES[key].label} / ${list.filter(c=>state.collection[c.id]>0).length} sur ${list.length}`;const grid=document.createElement('div');grid.className='grid';grid.append(...list.map(c=>card(c)));zone.append(heading,grid);}if(!found)zone.innerHTML='<p class="empty">Aucune carte ne correspond à ces filtres.</p>';}
for(const [key,r] of Object.entries(RARETES)){const o=document.createElement('option');o.value=key;o.textContent=r.label;$('rarity').append(o);}['search','rarity','owned'].forEach(id=>$(id).addEventListener('input',renderCollection));$('bet').onchange=timer;
function legacy(){try{const saved=JSON.parse(localStorage.getItem('mon-jeu-de-cartes'));return saved||{collection:JSON.parse(localStorage.getItem('ma-collection'))||{}};}catch{return {};}}
async function request(action,extra={}){if(busy)return;busy=true;timer();$('sell').disabled=true;document.querySelectorAll('[data-claim]').forEach(b=>b.disabled=true);$('status').textContent='Sauvegarde en cours…';try{const response=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...extra,...(!initialized?{legacy:legacy()}:{} )})});const data=await response.json();if(action==='casino')await new Promise(resolve=>setTimeout(resolve,650));if(!response.ok)throw Error(data.error||'Connexion indisponible.');state=data.state;offset=data.serverTime-Date.now();initialized=true;questDefinitions=data.quests||questDefinitions;$('status').textContent=data.message||'Ta collection est sauvegardée.';if(action==='open'){$('resultat').replaceChildren(...data.cards.map((c,i)=>{const el=card(c,true,c.new);el.classList.add('reveal');el.style.animationDelay=`${i*.13}s`;return el;}));
 const rare=data.cards.filter(c=>['legendaire','mythique','cristal'].includes(c.rarete));
 $('pack-cards').replaceChildren(...data.cards.map((c,i)=>{const el=card(c,true,c.new);el.classList.add('reveal');if(rare.includes(c))el.classList.add('rare-pull');el.style.animationDelay=`${i*.15}s`;return el;}));
 $('rare-message').textContent=rare.length?rare.map(c=>`${RARETES[c.rarete].label} · ${c.nom}`).join(' / '):'À toi de les découvrir.';
 if(!$('pack-dialog').open)$('pack-dialog').showModal();
 if(rare.length)celebrate('rare');
 }if(action==='casino'){$('casino-message').textContent=data.message;[...$('reels').children].forEach((el,i)=>el.textContent=data.symbols[i]);$('casino-card').replaceChildren(...data.cards.map(c=>{const el=card(c,true,c.new);el.classList.add(['legendaire','mythique','cristal'].includes(c.rarete)?'rare-pull':'reveal');return el;}));
 if(data.symbols.every(s=>s===data.symbols[0])){celebrate('win');const machine=document.querySelector('.machine');machine.classList.remove('winner');void machine.offsetWidth;machine.classList.add('winner');}
 }if(action==='claim')celebrate('win');render();}catch(e){$('status').textContent=e.message;if(action==='casino')$('casino-message').textContent=e.message; if(!initialized){const retry=document.createElement('button');retry.textContent='Réessayer';retry.className='retry';retry.onclick=()=>request('sync');$('status').append(' ',retry);}}finally{busy=false;$('reels').classList.remove('spinning');if(state)render();}}
$('open').onclick=()=>request('open');$('sell').onclick=()=>request('sell');$('play').onclick=()=>{if(busy)return;$('reels').classList.add('spinning');request('casino',{bet:Number($('bet').value)});};
function celebrate(kind){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const zone=$('celebration');zone.replaceChildren();zone.className=kind;
 for(let i=0;i<32;i++){const spark=document.createElement('i');spark.style.setProperty('--x',`${Math.random()*100}vw`);spark.style.setProperty('--drift',`${(Math.random()-.5)*220}px`);spark.style.setProperty('--delay',`${Math.random()*.35}s`);spark.style.setProperty('--turn',`${Math.random()*720}deg`);zone.append(spark);}
 setTimeout(()=>zone.replaceChildren(),2200);
}
function renderQuests(){
 const d=state.daily;if(!d)return;
 $('quest-list').replaceChildren(...questDefinitions.map((q,i)=>{
 const value=Math.min(q.target,d.progress[q.id]||0),claimed=d.claimed.includes(q.id),done=value===q.target;
 const row=document.createElement('article');row.className=`quest${claimed?' completed':''}`;
 row.innerHTML=`<span class="quest-number">0${i+1}</span><div class="quest-content"><h2>${q.label}</h2><progress max="${q.target}" value="${value}" aria-label="${q.label}"></progress><span class="fine">${value} / ${q.target}</span></div><div class="quest-reward"><strong>+${format(q.reward)} jeton</strong><button class="${done&&!claimed?'primary':'secondary'}" data-claim="${q.id}">${claimed?'Récupéré ✓':done?'Récupérer':'En cours'}</button></div>`;
 const button=row.querySelector('button');button.disabled=busy||claimed||!done;button.onclick=()=>request('claim',{quest:q.id});return row;
 }));
 const ready=questDefinitions.filter(q=>d.progress[q.id]>=q.target&&!d.claimed.includes(q.id)).length;
 $('quest-badge').textContent=ready||'';
 updateQuestClock();
}
function updateQuestClock(){if(!state?.daily)return;const now=Date.now()+offset;const remaining=Math.max(0,Math.ceil((new Date(state.daily.day+'T00:00:00Z').getTime()+86400000-now)/1000));$('quest-reset').textContent=remaining?`Renouvellement dans ${Math.floor(remaining/3600)} h ${String(Math.floor(remaining%3600/60)).padStart(2,'0')} min · UTC`:'Nouvelles quêtes disponibles';if(!remaining&&!busy)request('sync');}
$('close-pack').onclick=$('keep-cards').onclick=()=>$('pack-dialog').close();
$('pack-dialog').addEventListener('click',e=>{if(e.target===$('pack-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
request('sync');setInterval(()=>{timer();updateQuestClock();},1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)request('sync');});
