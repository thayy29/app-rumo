// Tokens do DESIGN.md (claro e escuro). Cor literal fora daqui reprova na revisão (ADR-010).

export const cores = {
  claro: {
    fundo: '#F7F4EA',
    celula: '#FFFFFF',
    texto: '#2A2722',
    apoio: '#5F584E',
    linha: 'rgba(42,39,34,0.12)',
    acao: '#4574C5',
    acaoTexto: '#FFFFFF',
    link: '#2F59A6',
    suave: '#C1D1EB',
    ok: '#2F7D4F',
    alerta: '#9A4A1E',
  },
  escuro: {
    fundo: '#191719',
    celula: '#262326',
    texto: '#F4F1E8',
    apoio: '#C8C2B8',
    linha: 'rgba(255,255,255,0.12)',
    acao: '#7699D4',
    acaoTexto: '#191719',
    link: '#8FB0E3',
    suave: '#C1D1EB',
    ok: '#7FC79A',
    alerta: '#E8A27A',
  },
} as const;

export type Cores = (typeof cores)['claro'] | (typeof cores)['escuro'];

export const raio = { celula: 14, botao: 999, sheet: 40 } as const;
export const espaco = { xs: 4, s: 8, m: 12, l: 16, xl: 24 } as const;
