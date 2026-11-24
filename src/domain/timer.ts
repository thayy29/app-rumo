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
