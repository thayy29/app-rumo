import type { InfoSecao, Secao } from './tipos';

// O que é cada seção de uma track de pista, para quem não sabe em qual está.
export const SECAO: Record<Secao, InfoSecao> = {
  INTRO: {
    id: 'INTRO',
    papel: 'Abre a track só com bateria, para o DJ mixar por cima da música anterior.',
    comoReconhecer: 'Kick, hats e percussão; sem baixo e sem harmonia.',
  },
  GROOVE: {
    id: 'GROOVE',
    papel: 'O verso: apresenta o baixo e os elementos um de cada vez.',
    comoReconhecer: 'A cada 8 compassos entra algo novo; ainda não é a parte mais cheia.',
  },
  BUILD: {
    id: 'BUILD',
    papel: 'Cria tensão antes do drop: tira o grave e sobe filtros, risers e reverb.',
    comoReconhecer: 'Parece que algo vai acontecer; o kick ou o baixo somem no fim.',
  },
  'DROP 1': {
    id: 'DROP 1',
    papel: 'O momento de dança: tudo junto, com o hook na frente.',
    comoReconhecer: 'É a parte mais cheia e mais alta até aqui.',
  },
  BREAK: {
    id: 'BREAK',
    papel: 'Respiro: a energia cai e a harmonia, o vocal e as texturas aparecem.',
    comoReconhecer: 'Sem kick e sem baixo; dá vontade de o groove voltar.',
  },
  'BUILD 2': {
    id: 'BUILD 2',
    papel: 'Prepara a volta, mais curto que o primeiro build.',
    comoReconhecer: 'A energia sobe de novo a partir do break.',
  },
  'DROP 2': {
    id: 'DROP 2',
    papel: 'O pico da track: o drop com uma diferença (camada, baixo ou progressão).',
    comoReconhecer: 'Lembra o primeiro drop, mas com algo novo.',
  },
  OUTRO: {
    id: 'OUTRO',
    papel: 'Fecha espelhando a intro, para o DJ sair para a próxima track.',
    comoReconhecer: 'Os elementos saem a cada 8 compassos até sobrar kick e hats.',
  },
};
