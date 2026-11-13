import { randomBytes, randomInt } from 'node:crypto';
import { db } from '../../db/index.ts';
import { players } from '../../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { initial, action } from './game.mjs';
export const config = { path:'/api/*' };
export default async function handler(request) {
  const headers = {'Cache-Control':'no-store','Content-Type':'application/json'};
  if(new URL(request.url).pathname!=='/api/game') return new Response('{}',{status:404,headers});
  if(request.method!=='POST') return new Response('{}',{status:405,headers});
  if(request.headers.get('origin') && request.headers.get('origin')!==new URL(request.url).origin) return new Response('{}',{status:403,headers});
  try {
    const raw=await request.text();
    if(raw.length>50000) return new Response('{}',{status:413,headers});
    const body=JSON.parse(raw);
    let id=request.headers.get('cookie')?.match(/(?:^|;\s*)cartex_player=([a-f0-9]{64})(?:;|$)/)?.[1];
    if(!id) {
      id=randomBytes(32).toString('hex');
      await db.insert(players).values({id,state:initial(Date.now(),body.legacy)});
      headers['Set-Cookie']=`cartex_player=${id}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=31536000`;
    }
    for(let attempt=0;attempt<5;attempt++) {
      const [player]=await db.select().from(players).where(eq(players.id,id));
      if(!player) return new Response(JSON.stringify({error:'Session introuvable. Efface les cookies du site pour recommencer.'}),{status:401,headers});
      const result=action(player.state,body,Date.now(),()=>randomInt(0,2**32)/2**32);
      const updated=await db.update(players).set({state:result.state,version:player.version+1}).where(and(eq(players.id,id),eq(players.version,player.version))).returning({id:players.id});
      if(updated.length) return new Response(JSON.stringify(result),{headers});
    }
    return new Response(JSON.stringify({error:'Une autre action est en cours. Réessaie.'}),{status:409,headers});
  } catch(error) {
    const known=/mise|jeton|booster|Action|Choisis|Quête/.test(error.message);
    return new Response(JSON.stringify({error:known?error.message:'La sauvegarde est indisponible. Réessaie dans un instant.'}),{status:known?400:503,headers});
  }
}
