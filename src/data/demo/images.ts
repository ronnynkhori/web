/**
 * DEMO image registry: AI-generated stand-ins for the proposal, not real events
 * or people. Nothing here depicts the CPLP Games. Replace with Organising
 * Committee photography (with safeguarding consent) before launch.
 * Files: public/images/demo (scripts/import-demo-images.mjs).
 * `focus` keeps faces and the action in frame when a layout crops the photo.
 */
import type { Localized } from "@/lib/i18n/config";
import type { ImageAsset } from "../types";
import dimensions from "./dimensions.json";

type DemoName = keyof typeof dimensions;

function demo(name: DemoName, en: string, pt: string, focus = "50% 50%"): ImageAsset {
  const d = dimensions[name];
  const alt: Localized = { en, pt };
  return {
    src: `/images/demo/${name}.jpg`,
    width: d.width,
    height: d.height,
    alt,
    focus,
    credit: "AI-generated demo",
    isDemo: true,
  };
}

export const demoImages = {
  athletics: demo("ao-athletics", "Three young sprinters race down the straight at sunset", "Três jovens velocistas na reta ao pôr do sol", "50% 22%"),
  paraAthletics: demo("ao-para-athletics", "A wheelchair racer pushes hard on a blue track", "Um atleta em cadeira de rodas acelera numa pista azul", "50% 62%"),
  basketball: demo("ao-basketball", "3x3 players jump for the ball on a seafront court at sunset", "Jogadores de 3x3 saltam pela bola num campo à beira-mar ao pôr do sol", "50% 25%"),
  football: demo("ao-football", "Two young footballers in red and blue contest the ball under floodlights", "Dois jovens futebolistas de vermelho e azul disputam a bola sob os holofotes", "50% 40%"),
  karate: demo("ao-karate", "A young karateka in a white gi throws a punch on a blue tatami", "Uma jovem karateca de kimono branco executa um soco num tatami azul", "50% 35%"),
  taekwondo: demo("ao-taekwondo", "A taekwondo athlete lands a high kick in the arena", "Um atleta de taekwondo executa um pontapé alto na arena", "50% 25%"),
  tennis: demo("ao-tennis", "A young tennis player tosses the ball to serve under a blue sky", "Uma jovem tenista lança a bola para servir sob um céu azul", "50% 30%"),
  beachVolleyball: demo("ao-beach-volleyball", "A beach volleyball player rises to spike on a palm-lined beach", "Um jogador de voleibol de praia salta para atacar numa praia com palmeiras", "50% 20%"),
  chess: demo("ao-chess", "A young chess player moves a knight during a tournament", "Um jovem xadrezista move um cavalo durante um torneio", "50% 4%"),
  stadium: demo("ao-stadium", "Aerial view of a floodlit stadium at dusk", "Vista aérea de um estádio iluminado ao entardecer", "50% 60%"),
  parade: demo("ao-parade", "Young athletes parade with flags under fireworks", "Jovens atletas desfilam com bandeiras sob fogo de artifício", "50% 45%"),
  cultural: demo("ao-cultural", "Dancers in Angolan fabrics perform with drummers at night", "Bailarinos com panos angolanos dançam ao som de tambores à noite", "40% 30%"),
  closing: demo("ao-closing", "Young athletes from four continents celebrate under confetti", "Jovens atletas de quatro continentes celebram sob confetes", "50% 35%"),
  luanda: demo("ao-luanda", "Luanda bay seafront at blue hour", "A baía de Luanda à hora azul", "60% 55%"),
  arena: demo("ao-arena", "A packed indoor pavilion around a blue competition mat", "Um pavilhão cheio em torno de um tapete de competição azul"),
  volunteers: demo("ao-volunteers", "Smiling volunteers with red, blue and yellow lanyards", "Voluntários sorridentes com fitas vermelhas, azuis e amarelas", "35% 30%"),
  medals: demo("ao-medals", "Gold, silver and bronze medals on red, blue and yellow ribbons", "Medalhas de ouro, prata e bronze com fitas vermelhas, azuis e amarelas"),
  fans: demo("ao-fans", "Fans with red, blue and yellow face paint cheer in the stands", "Adeptos com a cara pintada de vermelho, azul e amarelo nas bancadas", "50% 45%"),
  start: demo("ao-start", "A sprinter in the starting position on a blue track", "Uma velocista na posição de partida numa pista azul", "40% 25%"),
  broadcast: demo("ao-broadcast", "A TV camera films a floodlit football match", "Uma câmara de televisão filma um jogo de futebol iluminado", "40% 45%"),
} satisfies Record<string, ImageAsset>;
