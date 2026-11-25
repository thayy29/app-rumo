// Tokens do DESIGN.md e do canvas v2 (claro e escuro).
// Cor literal fora daqui reprova na revisão (ADR-010).

export const cores = {
  claro: {
    fundo: '#F7F4EA',
    celula: '#FFFEFB',
    texto: '#2A2722',
    apoio: '#5F584E',
    linha: 'rgba(42,39,34,0.16)',
    separador: 'rgba(42,39,34,0.10)',
    acao: '#4574C5',
    acaoTexto: '#FFFFFF',
    link: '#2F59A6',
    destaque: '#C1D1EB',
    destaqueTinta: '#2F59A6',
    tinta: 'rgba(69,116,197,0.11)',
    selecao: 'rgba(69,116,197,0.10)',
    halo: 'rgba(118,153,212,0.22)',
    mascote: '#6C92D6',
    mascote2: '#4574C5',
    mascoteOlho: '#1E2740',
    sombra: '#2A2722',
    alerta: '#9A4A1E',
  },
  escuro: {
    fundo: '#191719',
    celula: '#262426',
    texto: '#F4F1E8',
    apoio: '#C8C2B8',
    linha: 'rgba(255,255,255,0.18)',
    separador: 'rgba(255,255,255,0.10)',
    acao: '#7699D4',
    acaoTexto: '#191719',
    link: '#8FB0E3',
    destaque: '#C1D1EB',
    destaqueTinta: '#C1D1EB',
    tinta: 'rgba(193,209,235,0.14)',
    selecao: 'rgba(193,209,235,0.12)',
    halo: 'rgba(118,153,212,0.16)',
    mascote: '#C1D1EB',
    mascote2: '#7699D4',
    mascoteOlho: '#1E2740',
    sombra: '#000000',
    alerta: '#E8A27A',
  },
} as const;

type Paleta = { [K in keyof (typeof cores)['claro']]: string };
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
