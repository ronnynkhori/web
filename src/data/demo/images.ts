/**
 * DEMO image registry: AI-generated stand-ins for the proposal, not real events
 * or people. Nothing here depicts the CPLP Games. Replace with Organising
 * Committee photography (with safeguarding consent) before launch.
 * Files: public/images/demo (scripts/import-demo-images.mjs).
 */
import type { Localized } from "@/lib/i18n/config";
import type { ImageAsset } from "../types";
import dimensions from "./dimensions.json";

type DemoName = keyof typeof dimensions;

function demo(name: DemoName, en: string, pt: string): ImageAsset {
  const d = dimensions[name];
  const alt: Localized = { en, pt };
  return {
    src: `/images/demo/${name}.jpg`,
    width: d.width,
    height: d.height,
    alt,
    credit: "AI-generated demo",
    isDemo: true,
  };
}

export const demoImages = {
  athletics: demo("ao-athletics", "Three young sprinters race down the straight at sunset", "Três jovens velocistas na reta ao pôr do sol"),
  paraAthletics: demo("ao-para-athletics", "A wheelchair racer pushes hard on a blue track", "Um atleta em cadeira de rodas acelera numa pista azul"),
  basketball: demo("ao-basketball", "3x3 players jump for the ball on a seafront court at sunset", "Jogadores de 3x3 saltam pela bola num campo à beira-mar ao pôr do sol"),
  football: demo("ao-football", "Two young footballers in red and blue contest the ball under floodlights", "Dois jovens futebolistas de vermelho e azul disputam a bola sob os holofotes"),
  karate: demo("ao-karate", "A young karateka in a white gi throws a punch on a blue tatami", "Uma jovem karateca de kimono branco executa um soco num tatami azul"),
  taekwondo: demo("ao-taekwondo", "A taekwondo athlete lands a high kick in the arena", "Um atleta de taekwondo executa um pontapé alto na arena"),
  tennis: demo("ao-tennis", "A young tennis player tosses the ball to serve under a blue sky", "Uma jovem tenista lança a bola para servir sob um céu azul"),
  beachVolleyball: demo("ao-beach-volleyball", "A beach volleyball player rises to spike on a palm-lined beach", "Um jogador de voleibol de praia salta para atacar numa praia com palmeiras"),
  chess: demo("ao-chess", "A young chess player moves a knight during a tournament", "Um jovem xadrezista move um cavalo durante um torneio"),
  stadium: demo("ao-stadium", "Aerial view of a floodlit stadium at dusk", "Vista aérea de um estádio iluminado ao entardecer"),
  parade: demo("ao-parade", "Young athletes parade with flags under fireworks", "Jovens atletas desfilam com bandeiras sob fogo de artifício"),
  cultural: demo("ao-cultural", "Dancers in Angolan fabrics perform with drummers at night", "Bailarinos com panos angolanos dançam ao som de tambores à noite"),
  closing: demo("ao-closing", "Young athletes from four continents celebrate under confetti", "Jovens atletas de quatro continentes celebram sob confetes"),
  luanda: demo("ao-luanda", "Luanda bay seafront at blue hour", "A baía de Luanda à hora azul"),
  arena: demo("ao-arena", "A packed indoor pavilion around a blue competition mat", "Um pavilhão cheio em torno de um tapete de competição azul"),
  volunteers: demo("ao-volunteers", "Smiling volunteers with red, blue and yellow lanyards", "Voluntários sorridentes com fitas vermelhas, azuis e amarelas"),
  medals: demo("ao-medals", "Gold, silver and bronze medals on red, blue and yellow ribbons", "Medalhas de ouro, prata e bronze com fitas vermelhas, azuis e amarelas"),
  fans: demo("ao-fans", "Fans with red, blue and yellow face paint cheer in the stands", "Adeptos com a cara pintada de vermelho, azul e amarelo nas bancadas"),
  start: demo("ao-start", "A sprinter in the starting position on a blue track", "Uma velocista na posição de partida numa pista azul"),
  broadcast: demo("ao-broadcast", "A TV camera films a floodlit football match", "Uma câmara de televisão filma um jogo de futebol iluminado"),
} satisfies Record<string, ImageAsset>;
