// O tempo do bloco vem de carimbos de horário, nunca de um contador em memória.
// Assim ele continua certo com o app em segundo plano ou fechado. Ver ADR-008.

export type CarimbosDoBloco = {
  iniciadoEm: number;
  duracaoMs: number;
  pausadoTotalMs: number;
  pausadoEm: number | null;
};

export function restanteMs(b: CarimbosDoBloco, agora: number): number {
  const referencia = b.pausadoEm ?? agora;
  const decorrido = referencia - b.iniciadoEm - b.pausadoTotalMs;
  return Math.max(0, b.duracaoMs - decorrido);
}

export function fimPrevisto(b: CarimbosDoBloco, agora: number): number {
  return agora + restanteMs(b, agora);
}

export function pausar(b: CarimbosDoBloco, agora: number): CarimbosDoBloco {
  if (b.pausadoEm !== null) return b;
  return { ...b, pausadoEm: agora };
}

export function retomar(b: CarimbosDoBloco, agora: number): CarimbosDoBloco {
  if (b.pausadoEm === null) return b;
  return { ...b, pausadoTotalMs: b.pausadoTotalMs + (agora - b.pausadoEm), pausadoEm: null };
}

export function formatar(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const min = Math.floor(total / 60);
  const seg = total % 60;
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

export function acabou(b: CarimbosDoBloco, agora: number): boolean {
  return restanteMs(b, agora) === 0;
}

// Quanto do bloco já foi cumprido, de 0 a 1 (para a barra do Foco).
export function fracaoCumprida(b: CarimbosDoBloco, agora: number): number {
  if (b.duracaoMs <= 0) return 1;
  return 1 - restanteMs(b, agora) / b.duracaoMs;
}

export const LIMITE_ONDE_PAREI = 120;

// "Onde parei" é uma linha curta; vazio vira nulo para não guardar lixo.
export function limparOndeParei(texto: string): string | null {
  const limpo = texto.replace(/\s+/g, ' ').trim().slice(0, LIMITE_ONDE_PAREI);
  return limpo || null;
}
