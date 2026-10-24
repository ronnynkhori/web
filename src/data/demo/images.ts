/**
 * DEMO image registry. Every image here is a stand-in for the pitch:
 * - "unsplash": free photos under the Unsplash License (photo id kept for traceability);
 * - "generated": AI-generated illustrations of the intended photography, not real events or people.
 * Nothing here depicts the CPLP Games. Replace with Organising Committee photography (with
 * safeguarding consent, content-rules §6-7) before launch; `npm run check:release`
 * fails while this registry is referenced.
 * Files: public/images/demo (scripts/fetch-demo-images.ps1 + scripts/optimise-demo-images.mjs).
 */
import type { Localized } from "@/lib/i18n/config";
import type { ImageAsset } from "../types";
import dimensions from "./dimensions.json";

type DemoName = keyof typeof dimensions;

const UNSPLASH: Partial<Record<DemoName, string>> = {
  "athlete-set": "photo-1597347409198-f190c008a3bd",
  "athlete-woman": "photo-1650387379643-36c630863020",
  "athlete-yellow": "photo-1635863782730-4393246eee1e",
  arena: "photo-1504450758481-7338eba7524a",
  "basketball-hoop": "photo-1546519638-68e109498ffc",
  "basketball-sunset": "photo-1639398503142-6a87cca675a2",
  "crowd-derby": "photo-1700870748737-c1e533c9e3b4",
  "football-ball": "photo-1574629810360-7efbbe195018",
  "football-beach": "photo-1636050223919-64fb16b2921f",
  "football-kick": "photo-1580560230671-61e01dfdb285",
  "football-youth": "photo-1543326727-cf6c39e8f84c",
  "hero-sprinter": "photo-1698671823406-035c77ff6fcd",
  "martial-sunset": "photo-1555597673-b21d5c935865",
  "netball-hoop": "photo-1748191461876-ad952a9b9146",
  "netball-indoor": "photo-1662065931019-20fc202bfd21",
  "netball-match": "photo-1749020961577-d39509385dc6",
  "runner-sunset": "photo-1594882645126-14020914d58d",
  "runner-track": "photo-1600679472025-f74038492f72",
  "sprint-start-bw": "photo-1710736460914-4a7f22d736c4",
  "stadium-african": "photo-1740906792428-b296b3c77690",
  "stadium-day": "photo-1489944440615-453fc2b6a9a9",
  "stadium-night": "photo-1540747913346-19e32dc3e97e",
  "start-blocks": "photo-1461896836934-ffe607ba8211",
  "swim-butterfly": "photo-1530549387789-4c1017266635",
  "swim-freestyle": "photo-1519315901367-f34ff9154487",
  "track-race": "photo-1532444458054-01a7dd3e9fca",
  "volleyball-beach": "photo-1592656094267-764a45160876",
  "volleyball-sunset": "photo-1612872087720-bb876e2e67d1",
};

function demo(name: DemoName, alt: Localized): ImageAsset {
  const d = dimensions[name];
  return {
    src: `/images/demo/${name}.jpg`,
    width: d.width,
    height: d.height,
    alt,
    credit:
      d.source === "generated"
        ? "AI-generated demo"
        : d.source === "client"
          ? "Client-supplied concept (AI-generated)"
          : `Unsplash demo (${UNSPLASH[name] ?? name})`,
    isDemo: true,
  };
}

export const demoImages = {
  heroMain: demo("hero-main", {
    en: "A sprinter drives out of the starting blocks at dusk",
    pt: "Uma velocista arranca dos blocos de partida ao entardecer",
    fr: "Une sprinteuse s'élance des starting-blocks au crépuscule",
  }),
  heroMobile: demo("hero-mobile", {
    en: "A sprinter drives out of the starting blocks at dusk",
    pt: "Uma velocista arranca dos blocos de partida ao entardecer",
    fr: "Une sprinteuse s'élance des starting-blocks au crépuscule",
  }),
  storyOpening: demo("story-opening", {
    en: "Teams parade around a floodlit stadium track under confetti",
    pt: "Equipas desfilam na pista de um estádio iluminado, sob confetes",
    fr: "Les équipes défilent sur la piste d'un stade illuminé sous les confettis",
  }),
  storyCultural: demo("story-cultural", {
    en: "Dancers in capulana fabrics perform with drummers at night",
    pt: "Bailarinas com capulanas dançam ao som de tambores à noite",
    fr: "Des danseuses en capulanas se produisent avec des percussionnistes la nuit",
  }),
  storyClosing: demo("story-closing", {
    en: "Young athletes with medals celebrate together under confetti",
    pt: "Jovens atletas com medalhas celebram juntos sob confetes",
    fr: "De jeunes athlètes médaillés célèbrent ensemble sous les confettis",
  }),
  sportSwimming: demo("sport-swimming", {
    en: "A swimmer breathes mid-stroke in an outdoor pool",
    pt: "Uma nadadora respira a meio da braçada numa piscina exterior",
    fr: "Une nageuse respire en pleine nage dans un bassin extérieur",
  }),
  sportJudo: demo("sport-judo", {
    en: "Two judoka grip and throw in competition",
    pt: "Dois judocas em pega e projeção em competição",
    fr: "Deux judokas en saisie et projection en compétition",
  }),
  sportTaekwondo: demo("sport-taekwondo", {
    en: "A taekwondo athlete lands a high roundhouse kick",
    pt: "Um atleta de taekwondo executa um pontapé circular alto",
    fr: "Un athlète de taekwondo exécute un coup de pied circulaire haut",
  }),
  sportEsport: demo("sport-esport", {
    en: "Two e-sport competitors focus at a tournament desk",
    pt: "Dois competidores de e-sport concentrados numa mesa de torneio",
    fr: "Deux compétiteurs d'e-sport concentrés à une table de tournoi",
  }),
  sportVolleyball: demo("sport-volleyball", {
    en: "A volleyball player rises to spike at the net",
    pt: "Uma jogadora de voleibol salta para atacar junto à rede",
    fr: "Une joueuse de volley-ball s'élève pour smasher au filet",
  }),
  liveFeatured: demo("live-featured", {
    en: "Two youth footballers contest a volley under floodlights",
    pt: "Dois jovens futebolistas disputam um vólei sob os holofotes",
    fr: "Deux jeunes footballeurs se disputent une volée sous les projecteurs",
  }),
  newsTorch: demo("news-torch", {
    en: "A runner carries a torch along a palm-lined avenue as crowds cheer",
    pt: "Um corredor leva uma tocha por uma avenida com palmeiras entre aplausos",
    fr: "Un coureur porte une torche le long d'une avenue bordée de palmiers sous les acclamations",
  }),
  newsDawn: demo("news-dawn", {
    en: "Athletes train along the beach at dawn",
    pt: "Atletas treinam ao longo da praia ao amanhecer",
    fr: "Des athlètes s'entraînent sur la plage à l'aube",
  }),
  resultsMedal: demo("results-medal", {
    en: "A gold medal held against a green athletic top",
    pt: "Uma medalha de ouro segurada sobre uma camisola verde",
    fr: "Une médaille d'or tenue contre un maillot vert",
  }),
  mediaFans: demo("media-fans", {
    en: "Fans with painted faces cheer in the stands",
    pt: "Adeptos com a cara pintada aplaudem nas bancadas",
    fr: "Des supporters au visage peint encouragent dans les tribunes",
  }),
  guideVolunteers: demo("guide-volunteers", {
    en: "Volunteers welcome athletes at an accreditation desk",
    pt: "Voluntários recebem atletas num balcão de acreditação",
    fr: "Des bénévoles accueillent des athlètes à un guichet d'accréditation",
  }),
  athleteSet: demo("athlete-set", {
    en: "A sprinter in the set position on a track",
    pt: "Um velocista na posição de partida na pista",
    fr: "Un sprinteur en position de départ sur la piste",
  }),
  athleteWoman: demo("athlete-woman", {
    en: "An athlete rests after training",
    pt: "Uma atleta descansa depois do treino",
    fr: "Une athlète se repose après l'entraînement",
  }),
  athleteYellow: demo("athlete-yellow", {
    en: "An athlete trains with battle ropes",
    pt: "Uma atleta treina com cordas de batalha",
    fr: "Une athlète s'entraîne avec des cordes ondulatoires",
  }),
  arena: demo("arena", {
    en: "An indoor arena full of spectators",
    pt: "Um pavilhão cheio de espectadores",
    fr: "Une salle couverte remplie de spectateurs",
  }),
  basketballHoop: demo("basketball-hoop", {
    en: "A basketball drops toward the hoop",
    pt: "Uma bola de basquetebol cai em direção ao cesto",
    fr: "Un ballon de basket descend vers le panier",
  }),
  basketballSunset: demo("basketball-sunset", {
    en: "Young players on an outdoor basketball court at sunset",
    pt: "Jovens num campo de basquetebol ao ar livre ao pôr do sol",
    fr: "De jeunes joueurs sur un terrain de basket extérieur au coucher du soleil",
  }),
  crowdDerby: demo("crowd-derby", {
    en: "A packed football stadium crowd",
    pt: "A multidão num estádio de futebol cheio",
    fr: "La foule d'un stade de football comble",
  }),
  footballBall: demo("football-ball", {
    en: "A football at a player's feet on grass",
    pt: "Uma bola de futebol aos pés de um jogador na relva",
    fr: "Un ballon aux pieds d'un joueur sur la pelouse",
  }),
  footballBeach: demo("football-beach", {
    en: "Children play football on a beach",
    pt: "Crianças jogam futebol na praia",
    fr: "Des enfants jouent au football sur une plage",
  }),
  footballKick: demo("football-kick", {
    en: "A player attempts an overhead kick in front of goal",
    pt: "Um jogador tenta um pontapé de bicicleta em frente à baliza",
    fr: "Un joueur tente un retourné devant le but",
  }),
  footballYouth: demo("football-youth", {
    en: "Youth footballers chase the ball",
    pt: "Jovens futebolistas disputam a bola",
    fr: "De jeunes footballeurs se disputent le ballon",
  }),
  heroSprinter: demo("hero-sprinter", {
    en: "A sprinter on a red track",
    pt: "Uma velocista numa pista vermelha",
    fr: "Une sprinteuse sur une piste rouge",
  }),
  martialSunset: demo("martial-sunset", {
    en: "A martial artist trains at sunset",
    pt: "Um praticante de artes marciais treina ao pôr do sol",
    fr: "Un pratiquant d'arts martiaux s'entraîne au coucher du soleil",
  }),
  netballHoop: demo("netball-hoop", {
    en: "A netball drops through the hoop",
    pt: "Uma bola de netball passa pelo aro",
    fr: "Un ballon de netball traverse l'anneau",
  }),
  netballIndoor: demo("netball-indoor", {
    en: "Netball players contest the ball indoors",
    pt: "Jogadoras de netball disputam a bola num pavilhão",
    fr: "Des joueuses de netball se disputent le ballon en salle",
  }),
  netballMatch: demo("netball-match", {
    en: "Netball players reach for the ball near the post",
    pt: "Jogadoras de netball procuram a bola junto ao poste",
    fr: "Des joueuses de netball cherchent le ballon près du poteau",
  }),
  runnerSunset: demo("runner-sunset", {
    en: "A runner silhouetted against a sunset",
    pt: "A silhueta de uma corredora contra o pôr do sol",
    fr: "La silhouette d'une coureuse sur un coucher de soleil",
  }),
  runnerTrack: demo("runner-track", {
    en: "An athlete runs on a stadium track",
    pt: "Um atleta corre na pista de um estádio",
    fr: "Un athlète court sur la piste d'un stade",
  }),
  sprintStartBw: demo("sprint-start-bw", {
    en: "A sprinter crouched at the start line",
    pt: "Um velocista agachado na linha de partida",
    fr: "Un sprinteur accroupi sur la ligne de départ",
  }),
  stadiumAfrican: demo("stadium-african", {
    en: "A large stadium seen from the stands",
    pt: "Um grande estádio visto das bancadas",
    fr: "Un grand stade vu des tribunes",
  }),
  stadiumDay: demo("stadium-day", {
    en: "A football stadium under lights",
    pt: "Um estádio de futebol iluminado",
    fr: "Un stade de football éclairé",
  }),
  stadiumNight: demo("stadium-night", {
    en: "A stadium at night under floodlights",
    pt: "Um estádio à noite sob os holofotes",
    fr: "Un stade la nuit sous les projecteurs",
  }),
  startBlocks: demo("start-blocks", {
    en: "A sprinter's hands at the start line",
    pt: "As mãos de um velocista na linha de partida",
    fr: "Les mains d'un sprinteur sur la ligne de départ",
  }),
  swimButterfly: demo("swim-butterfly", {
    en: "A swimmer mid-butterfly stroke",
    pt: "Um nadador a meio de uma braçada de mariposa",
    fr: "Un nageur en plein papillon",
  }),
  swimFreestyle: demo("swim-freestyle", {
    en: "A swimmer racing freestyle in a lane",
    pt: "Um nadador em crawl numa pista",
    fr: "Un nageur en crawl dans une ligne d'eau",
  }),
  trackRace: demo("track-race", {
    en: "Runners race along the straight",
    pt: "Corredores disputam a reta",
    fr: "Des coureurs s'affrontent dans la ligne droite",
  }),
  volleyballBeach: demo("volleyball-beach", {
    en: "A beach volleyball on the sand",
    pt: "Uma bola de voleibol de praia na areia",
    fr: "Un ballon de beach-volley sur le sable",
  }),
  volleyballSunset: demo("volleyball-sunset", {
    en: "Beach volleyball players silhouetted at sunset",
    pt: "Silhuetas de jogadores de voleibol de praia ao pôr do sol",
    fr: "Silhouettes de joueurs de beach-volley au coucher du soleil",
  }),
} satisfies Record<string, ImageAsset>;
