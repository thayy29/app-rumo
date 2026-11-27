// Tema de estúdio (ADR-020): escuro sempre, como uma DAW, com uma cor por fase da track.
// Inspirado no Ableton sem copiar a marca. Cor literal fora daqui reprova na revisão (ADR-010).
const estudio = {
  fundo: '#141518',
  celula: '#1F2126',
  celula2: '#2A2D33',
  texto: '#EEF0F2',
  apoio: '#A5ABB4',
  linha: 'rgba(255,255,255,0.14)',
  separador: 'rgba(255,255,255,0.08)',
  acao: '#FFB547',
  acaoTexto: '#1A1408',
  link: '#FFC874',
  destaque: '#FFB547',
  destaqueTinta: '#FFC874',
  tinta: 'rgba(255,181,71,0.14)',
  selecao: 'rgba(255,181,71,0.12)',
  halo: 'rgba(255,181,71,0.10)',
  // Knob, o mascote: um potenciômetro com rosto.
  mascote: '#2B2E34',
  mascote2: '#D5D9DF',
  mascoteOlho: '#17191C',
  bochecha: 'rgba(255,125,176,0.45)',
  sombra: '#000000',
  alerta: '#FF8A6B',
};

export const cores = { estudio } as const;

// Uma cor por fase, como as cores de clip numa DAW: a fase se reconhece pela cor.
export const corDaFase = {
  ideia: '#B79CFF',
  loop: '#6CB8FF',
  arranjo: '#FFB547',
  vida: '#FF7DB0',
  automacao: '#4FD8B5',
  mix: '#9BDB5C',
  master: '#FFDE6B',
  export: '#F2F3F5',
} as const;

type Paleta = { [K in keyof typeof estudio]: string };
export type Cores = Paleta;

export const raio = { celula: 14, grupo: 24, cartao: 26, botao: 999 } as const;
export const espaco = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 28 } as const;

// Escala de texto do iOS, com o entreletra que a Apple usa em cada tamanho.
export const tipo = {
  tituloGrande: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: 0.37 },
  titulo1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0.36 },
  titulo2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: 0.35 },
  corpo: { fontSize: 17, lineHeight: 22, fontWeight: '400', letterSpacing: -0.41 },
  corpoForte: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.41 },
  subtitulo: { fontSize: 15, lineHeight: 20, fontWeight: '400', letterSpacing: -0.24 },
  nota: { fontSize: 13, lineHeight: 18, fontWeight: '400', letterSpacing: -0.08 },
} as const;
