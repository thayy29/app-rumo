import type { Estilo, InfoEstilo } from './tipos';

// Estilos e mapa de arranjo de partida, em compassos. O mapa é ponto de partida, não regra.
export const ESTILO: Record<Estilo, InfoEstilo> = {
  house: {
    id: 'house',
    nome: 'House',
    bpm: { min: 122, max: 127, padrao: 124 },
    groove: '4/4 reto, swing 16 leve nos hats e na percussão',
    timbres: '909, piano (Korg M1, Rhodes), organ bass, vocal',
    mix: 'Brilhante, kick na frente',
    mapa: { INTRO: 32, GROOVE: 16, BUILD: 16, 'DROP 1': 32, BREAK: 16, 'BUILD 2': 8, 'DROP 2': 32, OUTRO: 32 },
  },
  deep: {
    id: 'deep',
    nome: 'Deep house',
    bpm: { min: 118, max: 124, padrao: 120 },
    groove: '4/4 mais solto, hats e shaker com ghost notes',
    timbres: 'Acordes m7 11/9, Rhodes, órgão, deep bass em sine',
    mix: 'Mais escuro, graves redondos, agudos suaves',
    mapa: { INTRO: 32, GROOVE: 32, BUILD: 8, 'DROP 1': 32, BREAK: 32, 'BUILD 2': 8, 'DROP 2': 32, OUTRO: 32 },
  },
  garage: {
    id: 'garage',
    nome: 'UK garage',
    bpm: { min: 128, max: 134, padrao: 130 },
    groove: '2-step: kick quebrado, shuffle forte nos hats',
    timbres: 'Electric piano soulful, vocal R&B picotado, bass cortado',
    mix: 'Seco e punchy, vocal na frente',
    mapa: { INTRO: 16, GROOVE: 16, BUILD: 8, 'DROP 1': 16, BREAK: 16, 'BUILD 2': 8, 'DROP 2': 32, OUTRO: 16 },
  },
};
