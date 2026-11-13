import { mkdir, writeFile } from 'node:fs/promises';
import { CARTES } from '../public/catalog.mjs';
// Original vector illustrations. Coordinates use a common 240 × 180 art board.
const path=(d,fill='url(#paint)',extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const circle=(x,y,r,fill='url(#paint)')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const line=d=>path(d,'none','stroke="#e8e5c4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"');
const eye=(x,y)=>circle(x,y,4,'#f6efd4')+circle(x+1,y,2,'#142735');
const drawings={
'Orque':path('M30 104Q65 42 139 75L151 43 164 80Q196 88 203 113L229 95 219 122 232 139 199 128Q117 155 30 104Z','#243c50')+path('M47 109Q121 124 188 115Q139 145 74 124Z','#dfeee3')+circle(151,97,9,'#e8efe0'),
'Hibou':path('M66 49L91 65Q120 51 149 65L174 49 168 115Q150 154 120 151Q85 148 72 115Z')+circle(98,92,22,'#e8d4a0')+circle(143,92,22,'#e8d4a0')+eye(98,92)+eye(143,92)+path('M114 113L126 113 120 125Z','#c68c54')+line('M85 126L100 139M141 139L156 126'),
'Tigre':path('M65 67L61 37 91 52Q120 38 149 52L179 37 175 67Q187 117 154 143Q120 166 86 143Q53 117 65 67Z','#d69a56')+path('M100 121Q120 111 140 121L133 144 107 144Z','#f2e0b9')+eye(91,96)+eye(149,96)+path('M113 122L127 122 120 132Z','#243240')+line('M112 132L104 139M128 139L120 132')+path('M108 48L120 76 132 48M62 82L83 90 64 99M178 82L157 90 176 99M71 115L91 116 81 128M169 115L149 116 159 128','#283744'),
'Koala':circle(66,67,29,'#718f97')+circle(174,67,29,'#718f97')+circle(66,67,18,'#b7b6aa')+circle(174,67,18,'#b7b6aa')+path('M74 75Q120 38 166 75L166 119Q152 155 120 152Q88 155 74 119Z','#9bb0ab')+eye(94,99)+eye(146,99)+path('M113 95Q120 89 127 95L132 120Q120 130 108 120Z','#304452'),
'Loutre':path('M67 111Q32 117 28 144Q59 145 81 134M82 127Q57 85 85 62Q92 39 111 58Q139 45 153 64Q180 83 160 115L178 142 145 148 121 127 99 151 75 146Z')+path('M91 77Q120 65 147 81L143 112Q120 133 94 108Z','#e8d6ac')+eye(103,88)+eye(135,88)+circle(120,100,5,'#263e43')+line('M119 105L113 111M125 111L120 105'),
'Tortue':path('M57 100L31 86 28 107 58 121M91 128L80 151 106 149 114 132M153 130L166 150 187 141 172 121M179 92Q214 63 224 90Q226 112 185 113')+path('M53 113Q57 44 119 45Q178 47 186 114Q123 147 53 113Z','#629a86')+line('M119 48L97 78 113 110 148 113 165 82 143 54M97 78L61 78M113 110L100 134M148 113L159 131')+eye(209,88),
'Corbeau':path('M35 69Q88 68 107 90Q104 44 145 49Q168 47 178 66L211 80 179 85Q175 129 129 139L79 155 97 126Q55 120 35 69Z','#344659')+path('M60 83Q105 87 120 119L92 121Z','#5f7a8b')+eye(158,65)+line('M129 139L124 155M143 136L146 152'),
'Cerf':path('M82 83L70 64 92 69M158 83L170 64 148 69M88 83Q120 65 152 83L145 125 120 151 95 125Z','#bc9166')+line('M95 77L78 48 59 35M79 48L82 25M74 44L53 48M145 77L162 48 181 35M161 48L158 25M166 44L187 48')+eye(103,101)+eye(137,101)+path('M110 132L130 132 120 143Z','#2c4145'),
'Panthère':path('M65 76L67 42 94 60Q120 51 146 60L173 42 175 76Q182 126 144 145L96 145Q58 126 65 76Z','#30414f')+eye(94,94)+eye(146,94)+path('M111 119L129 119 120 130Z','#ba9c9f')+line('M116 132L103 137M124 132L137 137M91 117L55 110M91 125L52 127M149 117L185 110M149 125L188 127'),
'Axolotl':path('M85 94L51 66 49 88 26 84 54 107 36 123 80 119M155 94L189 66 191 88 214 84 186 107 204 123 160 119','#c389a6')+path('M81 99Q78 63 120 63Q162 63 159 99L164 129Q120 155 76 129Z','#e6b6b2')+eye(98,105)+eye(142,105)+line('M107 124Q120 135 133 124'),
'Méduse':path('M62 93Q64 34 120 32Q176 34 178 93Q120 116 62 93Z')+line('M80 103Q60 125 85 150M105 106Q127 130 103 163M133 106Q115 135 140 155M159 102Q180 124 157 146')+path('M79 83Q88 51 113 48','none','stroke="#e8e5c4" stroke-width="4"'),
'Papillon':path('M117 93Q67 13 35 53Q24 84 86 106Q33 110 59 145Q90 165 117 111M123 93Q173 13 205 53Q216 84 154 106Q207 110 181 145Q150 165 123 111Z')+circle(72,72,15,'#e7c785')+circle(168,72,15,'#e7c785')+circle(79,130,8,'#d4a0b5')+circle(161,130,8,'#d4a0b5')+line('M120 78L120 130M120 83L108 61M120 83L132 61'),
'Scorpion':path('M88 104Q99 77 132 94Q154 109 131 132Q101 144 88 118M133 119Q187 130 190 90Q192 51 162 45L150 59 173 65Q192 108 142 104M87 102L58 78 42 84 30 64 31 93 59 104M89 117L55 125 36 114 28 137 54 145Z')+line('M101 128L83 148M118 134L116 154M133 128L146 146'),
'Cobra':path('M80 145Q32 132 57 113Q76 103 100 116L102 86Q70 57 91 31Q120 13 149 31Q170 57 138 86L134 123Q146 138 171 133Q181 147 152 153Q115 157 112 126Q90 119 76 125Q64 135 99 135Z')+eye(106,49)+eye(134,49)+line('M120 63L120 77M113 82L127 82'),
};
// Mythical creatures: distinct silhouettes, wings, heads and bodies.
const wing=path('M105 100Q52 22 24 43L41 91 24 111 76 121Z');
const dragon=path('M66 135Q120 151 139 111L126 83 150 57 180 64 199 89 174 100 157 91Q181 135 138 151L75 151Z')+eye(171,77);
const mane=path('M70 66L81 39 103 49 120 32 138 49 160 39 171 66 166 107 145 137 95 137 74 107Z');
Object.assign(drawings,{
'Griffon':wing+path('M71 124L98 85 141 100 171 131 161 147 129 127 97 146 63 146Z','#d5b875')+path('M107 94L110 48 145 36 169 53 191 64 163 76 147 67 142 108Z','#e6e0be')+eye(149,53),
'Kraken':path('M86 102Q69 27 120 25Q171 27 154 102Z')+Array.from({length:7},(_,i)=>line(`M${86+i*11} 97Q${40+i*26} 155 ${32+i*29} ${129+i%2*23}`)).join('')+eye(105,74)+eye(135,74),
'Basilic':dragon+path('M124 68L110 38 137 51 144 27 154 52 172 35 174 62Z','#c6b376'),
'Hydre':path('M71 146Q120 105 170 146L158 157 82 157Z')+[[-35,12],[0,0],[35,12]].map(([x,y])=>`<g transform="translate(${x} ${y})">${path('M107 139L106 67 93 48 109 29 134 34 149 55 126 64 127 138Z')}${eye(121,44)}</g>`).join(''),
'Chimère':wing+mane+path('M89 79Q120 62 151 79L146 111 120 130 94 111Z','#ceb985')+eye(103,92)+eye(137,92)+path('M112 109L128 109 120 118Z','#2e4249')+line('M84 62Q56 22 77 20M157 62Q184 22 163 20'),
'Pégase':wing+`<g transform="translate(240) scale(-1 1)">${wing}</g>`+path('M77 141L91 91 104 62 131 37 156 44 166 77 146 86 133 72 122 105 153 141 141 151 114 124 91 151Z','#d8e8df')+eye(145,57),
'Sphinx':path('M42 145L77 112 100 119 112 94 146 94 166 128 202 145Z','#c6aa70')+path('M85 79L90 42 120 26 150 42 155 79 138 111 102 111Z','#6d9a9c')+path('M102 52L138 52 137 88 120 103 103 88Z','#d3b17d')+eye(110,67)+eye(130,67)+line('M119 76L117 84 125 84M111 91L129 91'),
'Golem':path('M71 61L101 43 139 43 169 61 160 104 189 139 164 152 142 119 136 153 104 153 98 119 76 152 51 139 80 104Z','#829a8c')+path('M100 36L139 31 150 60 134 79 104 75 89 56Z','#a0b29a')+eye(109,54)+eye(132,52)+line('M111 69L132 67M104 86L121 103 135 88M91 64L102 50'),
'Minotaure':mane+path('M82 68Q39 66 56 25Q63 53 91 44M158 68Q201 66 184 25Q177 53 149 44Z','#e5d3a5')+path('M91 87L149 87 146 125Q120 145 94 125Z','#ac926c')+eye(100,81)+eye(140,81)+circle(109,116,4,'#314a48')+circle(131,116,4,'#314a48'),
'Cerbère':[-53,0,53].map((x,i)=>`<g transform="translate(${x} ${i===1?-9:10})">${path('M84 84L82 47 107 62 133 62 158 47 156 84 146 127 94 127Z','#566c7b')}${eye(104,85)}${eye(136,85)}${path('M105 106L135 106 120 120Z','#c2b399')}</g>`).join(''),
'Yéti':path('M59 144L72 95 88 85 88 52 105 29 137 32 153 58 153 85 171 96 182 144 158 151 145 115 144 153 96 153 95 115 82 151Z','#d7e5de')+path('M98 60Q120 47 143 62L137 88 104 88Z','#73939b')+eye(110,69)+eye(132,69)+line('M112 81L130 81'),
'Salamandre':path('M33 124Q72 152 106 112L127 69 160 63 187 80 166 95 145 90 131 121 154 139 145 151 116 135 89 150 76 140 96 125Q61 163 33 124Z','#ca8e64')+circle(119,105,6,'#e4c57d')+circle(144,77,5,'#e4c57d')+eye(166,77),
'Sirène':path('M104 89L86 117Q144 109 144 135L123 150 141 161 163 147 186 155 175 133Q166 101 133 96L136 80Z')+path('M94 69Q80 28 119 27Q154 32 147 77L133 84 108 84Z','#ac927d')+circle(120,57,19,'#e6c3a5')+path('M104 78L136 78 143 106 95 106Z','#d8b6a0')+line('M100 88L77 106M138 88L160 103'),
'Leviathan':path('M21 139Q30 89 81 113Q119 144 137 108Q147 82 123 77Q93 87 81 61Q98 21 138 32L168 26 160 46 192 64 172 91 152 82Q179 137 130 152Q83 169 62 136Q44 119 21 139Z')+eye(141,51)+path('M166 61L182 65 169 74Z','#e7d8b0'),
'Wyverne':wing+dragon+path('M161 59L163 28 177 61Z','#d9bd8b'),
});
const roles=['Chimiste','Alchimiste','Sentinelle','Oracle','Nomade','Chevalier','Archère','Druide','Enchanteur','Exploratrice','Pirate','Samouraï','Astronaute'];
roles.forEach((name,i)=>{
 let gear='';
 if(i<2)gear=path('M165 73L181 73 181 105 198 133Q198 150 173 150Q149 150 150 133L165 105Z','#94cdb4')+line('M160 125L187 125')+circle(171,135,4,'#ebdfa5');
 if([2,5].includes(i))gear=path('M174 30L187 48 180 115 165 115 158 48Z','#d8e2d5')+line('M156 117L187 117M172 117L172 144');
 if([3,7,8].includes(i))gear=line('M174 65L174 151')+circle(174,50,16,'#b9dfbd')+path('M174 29L179 45 195 50 179 55 174 71 169 55 153 50 169 45Z','#f3dfac');
 if(i===4||i===9)gear=path('M164 104L196 96 198 143 166 151Z','#d4bd8d')+line('M178 103L181 146M167 119L194 112');
 if(i===6)gear=line('M172 34Q215 88 172 149L172 34M149 95L216 95M204 87L216 95 204 103');
 if(i===10)gear=path('M166 68Q210 98 173 137L163 128Q190 99 159 82Z','#c9d6d1')+line('M160 130L179 144M165 137L153 151');
 if(i===11)gear=line('M166 149L201 50M190 62L205 67')+path('M90 53L102 23 120 41 138 23 151 53Z','#b08070');
 if(i===12)gear=circle(120,64,41,'#d0dcd5')+circle(120,64,31,'#436a7c')+path('M94 53Q106 36 127 40','none','stroke="#d6e3d6" stroke-width="5"')+path('M164 90L187 90 187 144 164 144Z','#a9c0b4');
 const hood=[3,4,7,8].includes(i)?path('M77 87L83 48 120 18 155 48 161 87Z'):'';
 const head=i===12?'':circle(120,64,25,'#d8b395')+path('M94 62Q88 25 119 30Q149 22 147 58L135 46 105 46Z','#394d53')+eye(110,63)+eye(130,63);
 const torso=path('M78 151L85 104 105 90 135 90 155 104 162 151Z',i===12?'#c4d7ce':'url(#paint)')+line('M104 97L120 122 136 97M96 136L145 136');
 drawings[name]=hood+torso+head+gear;
});
const stars=Array.from({length:15},(_,i)=>circle(22+(i*43)%202,20+(i*29)%130,i%3===0?2:1,'#e8dfba')).join('');
const planet=circle(120,89,43)+path('M51 119Q100 57 187 63Q215 69 155 106Q91 139 51 119Z','none','stroke="#d9d3a1" stroke-width="8"');
const mountain=path('M17 150L72 67 105 108 152 39 223 150Z','#4f7a80')+path('M128 79L152 39 177 83 153 71 142 85Z','#d7e0cb');
const cloud=path('M55 92Q36 65 65 59Q72 29 99 44Q124 22 146 49Q177 44 184 67Q207 91 177 100L66 100Z','#9eafb4');
Object.assign(drawings,{
'Aurore':stars+path('M18 99Q56 15 95 73T180 42T229 79L226 113Q199 64 170 99T91 113T18 133Z','#71b7a3')+path('M19 100Q66 38 99 87T179 67T229 92','none','stroke="#c4a0ba" stroke-width="9"')+mountain,
'Éclipse':stars+circle(120,88,51,'#e3c481')+circle(134,81,48,'#203749'),
'Nébuleuse':stars+path('M31 112Q14 43 82 52Q125 10 150 65Q212 26 211 89Q221 145 160 131Q110 171 83 123Q48 149 31 112Z','url(#mist)')+stars,
'Comète':stars+path('M174 39L68 110 85 136 215 24 127 94Z','#d4b982')+circle(79,119,22,'#dce6cd')+circle(79,119,12,'#9bbcc0'),
'Météore':stars+path('M195 28L61 102 96 143Z','#c88c68')+path('M169 47L69 106 92 127Z','#e6c88e')+circle(79,124,27,'#647d83')+circle(70,121,8,'#3c5662')+circle(91,134,6,'#3c5662'),
'Supernova':stars+path('M120 15L132 66 181 31 151 80 224 90 151 102 181 152 132 117 120 170 108 117 59 152 89 102 16 90 89 80 59 31 108 66Z','#b394a9')+circle(120,90,31,'#d9bb86')+circle(120,90,15,'#eff0cb'),
'Constellation':stars+line('M45 58L87 43 120 89 173 65 195 122 143 142 120 89 75 119 45 58')+[[45,58],[87,43],[120,89],[173,65],[195,122],[143,142],[75,119]].map(([x,y])=>circle(x,y,5,'#e6d9ac')).join(''),
'Satellite':stars+path('M97 70L134 59 151 108 114 119Z','#d7dace')+path('M28 83L87 66 103 115 44 132M145 49L204 32 220 81 161 98','#557e99')+line('M47 77L64 126M67 72L84 121M32 99L95 82M37 114L100 97M164 43L181 92M184 38L201 87M150 65L212 47M155 80L217 62M124 63L129 35')+circle(129,30,5,'#d8c991'),
'Orbite':stars+planet,
'Quasar':stars+path('M20 149L107 79 222 22 135 101Z','#b4d1c4')+path('M63 133L105 86 180 45 135 99Z','#edddb7')+circle(120,91,27,'#e1bc83')+path('M69 106Q95 61 157 69Q183 91 115 119Z','none','stroke="#ab9cb5" stroke-width="7"'),
'Tempête':cloud+path('M125 91L103 122 120 122 107 157 148 111 129 111 140 91Z','#e2c58a')+line('M65 116L51 144M173 115L159 143'),
'Blizzard':cloud+Array.from({length:6},(_,i)=>{const x=51+i*28,y=119+i%2*24;return line(`M${x-6} ${y}L${x+6} ${y}M${x} ${y-6}L${x} ${y+6}M${x-4} ${y-4}L${x+4} ${y+4}`)}).join(''),
'Mousson':cloud+Array.from({length:8},(_,i)=>line(`M${49+i*20} 113L${38+i*20} ${139+i%2*17}`)).join('')+path('M17 160Q60 139 99 159T222 155','none','stroke="#79b1bc" stroke-width="5"'),
'Givre':line('M120 28L120 151M67 59L173 121M67 121L173 59M120 52L102 38M120 52L138 38M120 127L102 141M120 127L138 141M86 71L67 77M86 71L83 50M155 110L175 104M155 110L158 131M86 110L67 104M86 110L83 131M155 71L175 77M155 71L158 50')+circle(120,90,14,'#acd3cd'),
'Brume':mountain+line('M25 97Q77 87 125 97T218 97M17 117Q63 105 122 117T224 117M34 138Q88 125 134 138T210 138'),
'Marée':path('M17 133Q43 125 66 90Q98 33 151 52Q177 63 166 88Q156 57 134 78Q109 106 156 126Q189 144 223 117L223 164 17 164Z','#6dafa9')+path('M65 92Q102 34 151 52Q177 63 166 88Q159 66 139 76Q114 94 141 116Q108 101 116 80Q86 80 65 92Z','#deead7')+line('M34 145Q72 126 103 142T205 147'),
'Corail':line('M121 152L120 62M120 101L81 80 75 45M81 80L49 63 42 37M120 123L163 91 169 49M163 91L199 77 203 52M120 81L141 59 145 33')+[[75,45],[42,37],[169,49],[203,52],[145,33]].map(([x,y])=>circle(x,y,9,'#ca9b98')).join(''),
'Abysse':path('M20 32L64 64 84 140 120 166 156 140 176 64 220 32 220 163 20 163Z','#365867')+path('M102 124Q118 110 138 124L152 137 129 145 102 141 88 134Z','#9fc4ae')+eye(129,126)+line('M126 119Q126 88 143 97')+circle(144,97,5,'#e2dcaa'),
'Oasis':path('M14 143Q70 98 122 135Q174 106 226 142L226 165 14 165Z','#c1a378')+path('M55 141Q119 109 190 143Q126 162 55 141Z','#7ebcb1')+path('M135 126L146 64 151 66 143 129Z','#a98f65')+path('M148 66Q111 34 96 71Q122 58 148 66Q166 20 192 52Q166 45 148 66Q185 49 199 80Q173 64 148 66Z','#71a17f'),
'Dune':circle(173,49,23,'#d9bc83')+path('M14 142Q61 93 105 100Q147 31 227 126L227 165 14 165Z','#c3a074')+path('M14 148Q98 103 105 100Q141 87 227 139L227 165 14 165Z','#a78068')+line('M108 102Q146 97 194 130'),
'Canyon':path('M14 41L71 53 85 102 103 114 103 165 14 165M226 30L166 54 155 109 137 121 131 165 226 165Z','#b38a71')+path('M110 165Q129 134 120 113L131 102 127 130 143 165Z','#8eb8b0')+line('M23 73L68 85M30 105L77 117M173 80L216 62M165 111L208 94'),
});
const tree=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${path('M-4 0L-4 -64 4 -64 4 0Z','#b59a73')}${path('M-33 -40L-18 -67 -29 -67 -11 -91 -19 -91 0 -120 19 -91 11 -91 29 -67 18 -67 33 -40Z','#6caa93')}</g>`;
const flower=(color)=>line('M120 150L120 87M120 126Q83 98 78 118Q94 140 120 136M120 113Q157 87 162 108Q148 129 120 124')+Array.from({length:6},(_,i)=>`<ellipse cx="120" cy="62" rx="15" ry="29" fill="${color}" transform="rotate(${i*60} 120 86)"/>`).join('')+circle(120,86,14,'#e1c88c');
Object.assign(drawings,{
'Forêt':tree(61,157,.8)+tree(177,157,.9)+tree(118,164,1.15),
'Taïga':mountain+tree(58,163,.8)+tree(167,164,1)+path('M143 88L167 44 190 88 173 81 166 66 156 85Z','#d8e2d4'),
'Mangrove':path('M89 161L110 99 99 52 124 52 129 104 156 161M110 115L69 161M128 118L185 161','#8f9470')+circle(82,65,30,'#6d9c82')+circle(124,46,35,'#83ae90')+circle(164,67,31,'#68947d')+line('M25 153Q65 145 103 153T216 153'),
'Bambou':path('M75 154L81 30 94 30 88 154M130 155L139 45 152 45 143 155','#85b394')+line('M80 62L92 63M78 98L90 99M137 80L149 81M134 119L146 120')+path('M90 76Q107 37 130 40Q117 67 90 76M144 103Q181 67 204 83Q181 105 144 103M81 116Q51 79 32 95Q56 117 81 116Z','#a6c59d'),
'Lotus':path('M48 140Q120 108 192 140Q120 167 48 140Z','#6caa91')+path('M120 126Q75 118 66 73Q109 74 120 107Q131 74 174 73Q165 118 120 126Z','#b890ac')+path('M120 125Q87 86 120 39Q153 86 120 125Z','#e1b6c1')+circle(120,115,10,'#e3ce98'),
'Orchidée':flower('#b699c0')+path('M107 89L120 110 135 89 123 80Z','#e0cfaa'),
'Rose de nuit':flower('#a382a7')+path('M103 73L125 64 140 79 134 96 112 100 101 87 121 77 131 85 120 91Z','#d8abb8')+circle(184,37,18,'#dfd7b0')+circle(192,31,17,'#1c3540'),
});
const gems=['Obsidienne','Opale','Rubis','Saphir','Émeraude','Ambre','Jade','Topaze','Améthyste','Onyx'];
const gemColors=['#6e6f92','#ccd8c4','#c6768e','#719bc2','#69b394','#c9a260','#89b49b','#d2ba78','#a28dc2','#7c8792'];
gems.forEach((name,i)=>{
 const crystal=i%3===0?'M64 120L80 53 112 29 150 41 175 124 124 153Z':i%3===1?'M59 85L91 44 152 44 183 85 120 151Z':'M76 44L151 39 179 90 149 143 88 148 61 97Z';
 drawings[name]=path(crystal,gemColors[i])+path('M91 49L120 84 151 45 143 109 120 146 102 105Z','#e6ead0','opacity=".35"')+line('M65 87L120 84 176 88M120 84L120 144')+path('M89 54L78 78M145 55L156 76','none','stroke="#f0ecd2" stroke-width="4"');
 if(name==='Ambre')drawings[name]+=path('M110 106L127 95 136 114 121 126Z','#675d48')+line('M122 107L106 92M126 111L143 99');
});
Object.assign(drawings,{
'Sablier':path('M79 35L161 35 158 62 133 89 158 118 161 145 79 145 82 118 107 89 82 62Z','#89b4b1')+path('M88 56L152 56 121 88 151 133 89 133 119 88Z','#ddc18a')+line('M72 31L168 31M72 149L168 149M77 33L77 147M163 33L163 147'),
'Boussole':circle(120,93,57,'#baac7c')+circle(120,93,46,'#294c55')+path('M120 50L136 94 120 136 104 94Z','#d9ddc4')+path('M120 50L120 94 104 94Z','#c58d83')+circle(120,93,6,'#e7cc8f')+line('M120 24L120 35M120 151L120 162M51 93L62 93M178 93L189 93'),
'Lanterne':path('M80 69L160 69 150 140 90 140Z','#c8b47e')+path('M92 76L148 76 139 131 101 131Z','#e6c98c')+path('M72 66L120 42 168 66Z','#7b9d91')+line('M106 45Q91 16 120 18Q148 16 135 45M120 78L120 129M84 146L156 146'),
'Masque':path('M54 54Q120 20 186 54L174 114 145 149 95 149 66 114Z')+path('M75 77L108 79 101 96 78 93M165 77L132 79 139 96 162 93','#203b47')+line('M120 74L110 116 128 116M102 131Q120 140 138 131'),
'Grimoire':path('M40 51Q80 34 120 57Q160 34 200 51L200 139Q161 124 120 146Q79 124 40 139Z','#c7bf99')+path('M48 58Q82 44 116 63L116 135Q80 119 48 132M124 63Q158 44 192 58L192 132Q160 119 124 135','#476a6d')+line('M59 73L99 80M59 86L99 93M59 100L86 104')+path('M159 69L166 88 184 95 166 102 159 121 152 102 134 95 152 88Z','#dbc28f'),
'Relique':path('M86 148L95 77 81 54 106 32 134 32 159 54 145 77 154 148Z','#9aab92')+path('M105 51L135 51 132 84 108 84Z','#d0c595')+circle(120,112,20,'#517d7d')+line('M109 111L120 98 132 112 120 126Z'),
'Portail':path('M61 153L61 73Q61 15 120 15Q179 15 179 73L179 153Z','#8d9e8e')+path('M77 153L77 74Q77 31 120 31Q163 31 163 74L163 153Z','url(#mist)')+line('M96 139Q144 136 144 89Q142 59 114 67Q95 76 110 96Q122 110 129 92M53 153L187 153'),
'Totem':path('M88 151L85 35 120 20 155 35 152 151Z','#b39774')+path('M89 55L47 44 35 61 89 87M151 55L193 44 205 61 151 87','#749d97')+eye(106,53)+eye(134,53)+path('M106 73L134 73 120 91Z','#ddc48b')+line('M98 107L142 107M99 125L141 125M120 104L120 145'),
'Amulette':line('M80 32Q120 97 160 32M84 33Q120 107 156 33')+path('M120 81L153 114 120 151 87 114Z','#c9b681')+path('M120 96L139 115 120 136 101 115Z','#7db6aa')+circle(120,115,5,'#e2e2bf'),
'Cloche céleste':path('M69 127L85 109 88 76Q90 42 120 42Q150 42 152 76L155 109 171 127Z','#c6b784')+circle(120,138,12,'#d6c691')+line('M120 22L120 41M64 128L176 128M49 75L42 75M191 75L198 75M58 49L49 41M182 49L191 41'),
'Éventail':path('M120 149L27 73Q120 -8 213 73Z','#c6a2a6')+line('M120 149L27 73M120 149L67 49M120 149L102 35M120 149L138 35M120 149L173 49M120 149L213 73')+path('M44 83Q120 22 196 83','none','stroke="#e3cf9b" stroke-width="8"'),
'Clé des songes':circle(94,64,30,'#bdaf81')+circle(94,64,17,'#2c4d58')+path('M108 84L174 145 187 132 173 118 160 129 151 120 165 108 153 96 141 107 120 76Z','#d8c58e')+circle(178,40,16,'#d4d5bc')+circle(185,34,15,'#1c3540'),
});
const buildings=['Temple oublié','Palais solaire','Jardin suspendu','Citadelle'];
buildings.forEach((name,i)=>{
 const base=path('M34 149L206 149 206 157 34 157Z','#c9bc99');
 const cols=[65,100,135,170].map(x=>path(`M${x-6} 146L${x-6} 79 ${x+6} 79 ${x+6} 146Z`,'#b5b9a0')).join('');
 if(i===0)drawings[name]=base+cols+path('M38 78L120 29 202 78Z','#9aaf9a')+line('M61 80L179 80M89 71L120 52 149 71')+path('M64 148Q72 93 95 106M167 148Q172 95 191 89','none','stroke="#6caa88" stroke-width="7"');
 if(i===1)drawings[name]=circle(120,42,29,'#d3bc7f')+base+cols+path('M49 87L49 64 84 64 84 84 101 84 101 57Q120 27 139 57L139 84 156 84 156 64 191 64 191 87Z','#c7bd99')+path('M108 149L108 113Q120 93 132 113L132 149Z','#31515b');
 if(i===2)drawings[name]=base+path('M51 146L51 107 189 107 189 146M75 102L75 72 165 72 165 102M97 67L97 43 143 43 143 67','#b6b29a')+path('M39 107L201 107M63 72L177 72M86 43L154 43','none','stroke="#86b18c" stroke-width="9"')+line('M60 109Q58 133 76 136M168 73Q160 103 183 120M107 44Q98 73 120 86');
 if(i===3)drawings[name]=base+path('M49 149L49 56 76 56 76 149M164 149L164 56 191 56 191 149M77 149L77 91 163 91 163 149M103 91L103 39 137 39 137 91','#93aaa1')+path('M40 57L63 27 85 57M155 57L178 27 200 57M95 40L120 15 145 40','#65858d')+path('M106 149L106 122Q120 101 134 122L134 149Z','#2a4752')+line('M61 73L61 87M178 73L178 87M120 49L120 65');
});
drawings['Arbre monde']=path('M85 159L107 110 101 71 135 71 131 110 158 159 124 142 107 159Z','#af9871')+circle(73,79,31,'#75a58c')+circle(167,79,31,'#75a58c')+circle(91,50,30,'#8db599')+circle(148,50,30,'#8db599')+circle(120,34,27,'#adca9e')+line('M120 116L119 49M114 93L80 75M128 90L163 70')+circle(120,64,8,'#e3cf92');
drawings['Bouzelouf']=path('M72 141L85 96 155 96 168 141Z','#749994')+path('M75 71L68 46 94 53Q120 38 146 53L172 46 165 71 158 108Q120 140 82 108Z','#a6bfaf')+path('M90 84L107 78 106 94 91 97M150 84L133 78 134 94 149 97','#243e4b')+path('M99 111L120 101 141 111 120 125Z','#d8cc9d')+path('M120 25L129 44 120 57 111 44Z','#b6ddd1');
drawings['Chinois']=path('M72 151L83 112 107 97 133 97 157 112 168 151Z','#7fa7a2')+circle(120,73,29,'#dcc0a3')+path('M90 67Q81 31 120 31Q159 31 150 67L135 52 104 52Z','#34464f')+eye(109,74)+eye(131,74)+line('M110 89Q120 95 130 89M104 107L120 128 136 107M120 128L120 148')+path('M120 15L128 29 120 42 112 29Z','#c3e1d5');
drawings['Colère']=path('M75 144L60 111 81 99 64 74 91 81 92 44 112 60 125 24 139 65 160 47 157 86 180 79 167 109 177 144Z','#b98588')+path('M86 104L154 104 146 139 94 139Z','#e3ac8f')+path('M88 86L111 99 90 101M152 86L129 99 150 101','#293d49')+path('M108 126L120 115 132 126Z','#4e4c52')+path('M120 57L129 78 120 92 111 78Z','#c7e4d3');
await mkdir(new URL('../public/art/',import.meta.url),{recursive:true});
for(const c of CARTES.filter(c=>c.id>=48)){
 if(!drawings[c.nom])throw new Error(`Missing drawing: ${c.nom}`);
 const hue=(c.id*37)%360;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" role="img"><title>${c.nom}</title><defs><linearGradient id="paint" x2=".8" y2="1"><stop stop-color="hsl(${hue} 28% 75%)"/><stop offset="1" stop-color="hsl(${hue} 24% 43%)"/></linearGradient><radialGradient id="mist"><stop stop-color="#e3d4bc"/><stop offset=".5" stop-color="#9e93b2"/><stop offset="1" stop-color="#446978"/></radialGradient><radialGradient id="bg"><stop stop-color="hsl(${hue} 19% 28%)"/><stop offset="1" stop-color="#172f36"/></radialGradient></defs><rect width="240" height="180" rx="10" fill="url(#bg)"/><circle cx="120" cy="88" r="69" fill="none" stroke="#d7d3ab" stroke-opacity=".13"/><ellipse cx="120" cy="160" rx="77" ry="8" fill="#112831" opacity=".45"/><g stroke-linejoin="round" stroke-linecap="round">${drawings[c.nom]}</g><path d="M15 24V15H24M216 15H225V24M15 156V165H24M216 165H225V156" fill="none" stroke="#d5c498" stroke-opacity=".5"/></svg>`;
 await writeFile(new URL(`../public/art/${c.id}.svg`,import.meta.url),svg);
}
console.log('100 card illustrations generated.');
