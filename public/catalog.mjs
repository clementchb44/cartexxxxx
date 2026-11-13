export const CARTES = [
  { id: 1,  nom: "Chien",    emoji: "🐶", rarete: "commun", pv: 35 },
  { id: 2,  nom: "Chat",     emoji: "🐱", rarete: "commun", pv: 60 },
  { id: 3,  nom: "Souris",   emoji: "🐭", rarete: "commun", pv: 45 },
  { id: 4,  nom: "Lapin",    emoji: "🐰", rarete: "commun", pv: 50 },
  { id: 5,  nom: "Poule",    emoji: "🐔", rarete: "commun", pv: 55 },
  { id: 6,  nom: "Renard",   emoji: "🦊", rarete: "rare", pv: 95 },
  { id: 7,  nom: "Panda",    emoji: "🐼", rarete: "rare", pv: 75 },
  { id: 8,  nom: "Lion",     emoji: "🦁", rarete: "rare", pv: 90 },
  { id: 9,  nom: "Loup",     emoji: "🐺", rarete: "rare", pv: 105 },
  { id: 10, nom: "Licorne",  emoji: "🦄", rarete: "epique", pv: 145 },
  { id: 11, nom: "Requin",   emoji: "🦈", rarete: "epique", pv: 130 },
  { id: 12, nom: "Aigle",    emoji: "🦅", rarete: "epique", pv: 135 },
  { id: 13, nom: "Dragon",   emoji: "🐉", rarete: "legendaire", pv: 200 },
  { id: 14, nom: "Phénix",   emoji: "🔥", rarete: "legendaire", pv: 220 },
  { id: 15, nom: "Galaxie",  emoji: "🌌", rarete: "mythique", pv: 360 },

  // ----- Cartes ajoutées -----
  // Communes
  { id: 16, nom: "Pizza",        emoji: "🍕", rarete: "commun", pv: 50 },
  { id: 17, nom: "Ballon",       emoji: "⚽", rarete: "commun", pv: 40 },
  { id: 18, nom: "Guitare",      emoji: "🎸", rarete: "commun", pv: 40 },
  { id: 19, nom: "Pomme",        emoji: "🍎", rarete: "commun", pv: 55 },
  { id: 20, nom: "Clé",          emoji: "🔑", rarete: "commun", pv: 45 },
  { id: 21, nom: "Livre",        emoji: "📚", rarete: "commun", pv: 30 },
  { id: 22, nom: "Parapluie",    emoji: "☂️", rarete: "commun", pv: 30 },
  { id: 23, nom: "Voiture",      emoji: "🚗", rarete: "commun", pv: 60 },
  { id: 24, nom: "Gâteau",       emoji: "🍰", rarete: "commun", pv: 40 },
  { id: 25, nom: "Casque",       emoji: "🎧", rarete: "commun", pv: 35 },
  { id: 26, nom: "Montre",       emoji: "⌚", rarete: "commun", pv: 50 },
  // Rares
  { id: 27, nom: "Fusée",        emoji: "🚀", rarete: "rare", pv: 70 },
  { id: 28, nom: "Couronne",     emoji: "👑", rarete: "rare", pv: 100 },
  { id: 29, nom: "Robot",        emoji: "🤖", rarete: "rare", pv: 85 },
  { id: 30, nom: "Volcan",       emoji: "🌋", rarete: "rare", pv: 105 },
  { id: 31, nom: "Trésor",       emoji: "💰", rarete: "rare", pv: 80 },
  { id: 32, nom: "Épée",         emoji: "⚔️", rarete: "rare", pv: 75 },
  { id: 33, nom: "Bouclier",     emoji: "🛡️", rarete: "rare", pv: 110 },
  { id: 34, nom: "Arc-en-ciel",  emoji: "🌈", rarete: "rare", pv: 90 },
  // Épiques
  { id: 35, nom: "Fantôme",      emoji: "👻", rarete: "epique", pv: 160 },
  { id: 36, nom: "Alien",        emoji: "👽", rarete: "epique", pv: 140 },
  { id: 37, nom: "Cristal",      emoji: "💎", rarete: "epique", pv: 155 },
  { id: 38, nom: "Tornade",      emoji: "🌪️", rarete: "epique", pv: 125 },
  { id: 39, nom: "Potion",       emoji: "🧪", rarete: "epique", pv: 120 },
  { id: 40, nom: "Trident",      emoji: "🔱", rarete: "epique", pv: 150 },
  // Légendaires
  { id: 41, nom: "Soleil",       emoji: "☀️", rarete: "legendaire", pv: 190 },
  { id: 42, nom: "Lune",         emoji: "🌙", rarete: "legendaire", pv: 170 },
  { id: 43, nom: "Éclair",       emoji: "⚡", rarete: "legendaire", pv: 210 },
  { id: 44, nom: "Planète",      emoji: "🪐", rarete: "legendaire", pv: 180 },
  // Mythiques
  { id: 45, nom: "Trou noir",    emoji: "🕳️", rarete: "mythique", pv: 340 },
  { id: 46, nom: "Big Bang",     emoji: "💥", rarete: "mythique", pv: 300 },
  { id: 47, nom: "Infini",       emoji: "♾️", rarete: "mythique", pv: 320 }
];
const nouveauxNoms = ["Orque", "Hibou", "Tigre", "Koala", "Loutre", "Tortue", "Corbeau", "Cerf", "Panthère", "Axolotl", "Méduse", "Papillon", "Scorpion", "Cobra", "Griffon", "Kraken", "Basilic", "Hydre", "Chimère", "Pégase", "Sphinx", "Golem", "Minotaure", "Cerbère", "Yéti", "Salamandre", "Sirène", "Leviathan", "Wyverne", "Chimiste", "Alchimiste", "Sentinelle", "Oracle", "Nomade", "Chevalier", "Archère", "Druide", "Enchanteur", "Exploratrice", "Pirate", "Samouraï", "Astronaute", "Aurore", "Éclipse", "Nébuleuse", "Comète", "Météore", "Supernova", "Constellation", "Satellite", "Orbite", "Quasar", "Tempête", "Blizzard", "Mousson", "Givre", "Brume", "Marée", "Corail", "Abysse", "Oasis", "Dune", "Canyon", "Forêt", "Taïga", "Mangrove", "Bambou", "Lotus", "Orchidée", "Rose de nuit", "Obsidienne", "Opale", "Rubis", "Saphir", "Émeraude", "Ambre", "Jade", "Topaze", "Améthyste", "Onyx", "Sablier", "Boussole", "Lanterne", "Masque", "Grimoire", "Relique", "Portail", "Totem", "Amulette", "Cloche céleste", "Éventail", "Clé des songes", "Temple oublié", "Palais solaire", "Jardin suspendu", "Citadelle", "Arbre monde"];
nouveauxNoms.forEach((nom, i) => { const rarete = ["commun","rare","epique","legendaire","mythique"][i % 5]; CARTES.push({ id: 48+i, nom,  rarete, pv: 40 + (i % 5)*65 + i%30 }); });
CARTES.push({id:145,nom:"Bouzelouf",emoji:"◈",rarete:"cristal",pv:420},{id:146,nom:"Chinois",emoji:"❖",rarete:"cristal",pv:440},{id:147,nom:"Colère",emoji:"✦",rarete:"cristal",pv:460});
for (const card of CARTES) if (card.id >= 48) card.image = `/art/${card.id}.svg`;
export const RARETES = {commun:{label:"Commun",chance:60,couleur:"#64746c"},rare:{label:"Rare",chance:25,couleur:"#426e9b"},epique:{label:"Épique",chance:10,couleur:"#896398"},legendaire:{label:"Légendaire",chance:4,couleur:"#b48d46"},mythique:{label:"Mythique",chance:1,couleur:"#ac5962"},cristal:{label:"Cristal",chance:0.5,couleur:"#8fcbbc"}};
