import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARTES } from '../public/catalog.mjs';
import { initial, accrue, action, INTERVAL } from '../netlify/server/game.mjs';
test('100 additional cards with stable unique ids and three crystal cards',()=>{assert.equal(CARTES.length,147);assert.equal(new Set(CARTES.map(c=>c.id)).size,147);assert.deepEqual(CARTES.filter(c=>c.rarete==='cristal').map(c=>c.nom),['Bouzelouf','Chinois','Colère']);});
test('offline accrual keeps partial interval and caps at ten',()=>{let s=initial(1000);accrue(s,1000+INTERVAL*2.5);assert.equal(s.boosters,3);assert.equal(s.anchor,1000+INTERVAL*2);accrue(s,1000+INTERVAL*100);assert.equal(s.boosters,10);const now=1000+INTERVAL*100;action(s,{action:'open'},now,()=>0);assert.equal(s.boosters,9);accrue(s,now+INTERVAL-1);assert.equal(s.boosters,9);accrue(s,now+INTERVAL);assert.equal(s.boosters,10);});
test('open spends reserve before tokens and grants five cards',()=>{const s=initial(0);const r=action(s,{action:'open'},0,()=>0);assert.equal(s.jetons,1);assert.equal(s.boosters,0);assert.equal(r.cards.length,5);action(s,{action:'open'},0,()=>0);assert.equal(s.jetons,0);assert.throws(()=>action(s,{action:'open'},0));});
test('casino validates bets, debit and all reward outcomes',()=>{for(const [roll,balance,cards] of [[0.05,5,0],[0.2,2,0],[0.4,0,1],[0.7,0,0]]){const s=initial(0);const r=action(s,{action:'casino',bet:1},0,()=>roll);assert.equal(s.jetons,balance);assert.equal(r.cards.length,cards);}assert.throws(()=>action(initial(0),{action:'casino',bet:-1},0));assert.throws(()=>action(initial(0),{action:'casino',bet:5},0));});
test('migration preserves existing collection and sale retains one copy',()=>{const s=initial(1000,{collection:{1:3,47:1},jetons:2.35});assert.equal(s.collection[47],1);action(s,{action:'sell'},1000);assert.equal(s.collection[1],1);assert.equal(s.jetons,2.45);action(s,{action:'sell'},1000);assert.equal(s.jetons,2.45);});
test('daily quests track actions, persist and reward only once',()=>{
 const now=Date.UTC(2026,10,13,12),s=initial(now);
 action(s,{action:'sync'},now);
 assert.equal(s.daily.day,'2026-11-13');
 assert.throws(()=>action(s,{action:'claim',quest:'packs'},now),/Quête/);
 assert.throws(()=>action(s,{action:'claim',quest:'unknown'},now),/Quête/);
 action(s,{action:'open'},now,()=>0);
 action(s,{action:'open'},now,()=>0);
 assert.equal(s.daily.progress.packs,2);assert.equal(s.daily.progress.cards,10);
 const saved=JSON.parse(JSON.stringify(s));
 action(saved,{action:'claim',quest:'packs'},now);
 assert.equal(saved.jetons,.5);
 assert.throws(()=>action(saved,{action:'claim',quest:'packs'},now),/Quête/);
 action(saved,{action:'claim',quest:'cards'},now);assert.equal(saved.jetons,1);
 action(saved,{action:'sell'},now);assert.equal(saved.daily.progress.sell,3);
 const before=saved.jetons;
 action(saved,{action:'claim',quest:'sell'},now);assert.equal(saved.jetons,before+.5);
});
test('daily quests reset at midnight UTC without losing collection or tokens',()=>{
 const now=Date.UTC(2026,10,13,23,59,59),s=initial(now);
 action(s,{action:'open'},now,()=>0);
 const collection={...s.collection},tokens=s.jetons;
 action(s,{action:'sync'},now+999);assert.equal(s.daily.progress.packs,1);
 action(s,{action:'sync'},now+1000);
 assert.equal(s.daily.day,'2026-11-14');
 assert.deepEqual(s.daily.progress,{packs:0,cards:0,sell:0});assert.deepEqual(s.daily.claimed,[]);
 assert.deepEqual(s.collection,collection);assert.equal(s.jetons,tokens);
 assert.throws(()=>action(s,{action:'claim',quest:'cards'},now+1000),/Quête/);
});
test('old saves gain daily quests on sync and ignore client supplied progress',()=>{
 const s=initial(0,{collection:{1:5}});
 const r=action(s,{action:'sync',daily:{progress:{packs:999}}},0);
 assert.equal(r.quests.length,3);assert.equal(s.daily.progress.packs,0);
 assert.equal(s.collection[1],5);
});
test('all 100 new cards have a local named illustration',async()=>{
 const {readFile}=await import('node:fs/promises');
 const cards=CARTES.filter(c=>c.id>=48);
 assert.equal(cards.length,100);
 assert.equal(new Set(cards.map(c=>c.image)).size,100);
 for(const c of cards){
   assert.match(c.image,/^\/art\/\d+\.svg$/);
   const svg=await readFile(new URL(`../public${c.image}`,import.meta.url),'utf8');
   assert.ok(svg.includes(`<title>${c.nom}</title>`));
   assert.match(svg,/viewBox="0 0 240 180"/);
   assert.ok(!svg.includes('<script'));
 }
});
