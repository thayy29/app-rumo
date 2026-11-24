// Importa um sumário colado (de curso, guia de certificação ou PDF) em grupos e tópicos.
// Funções puras: sem React, sem banco. Ver PRD v2, FR-002 e NFR-008.

export const LIMITE_LINHAS = 300;

export type GrupoImportado = { nome: string; topicos: string[] };

export type SumarioImportado = {
  grupos: GrupoImportado[];
  totalTopicos: number;
  linhasIgnoradas: number;
  truncado: boolean;
};

const PALAVRAS_DE_GRUPO =
  /^(m[óo]dulo|unidade|se[çc][ãa]o|cap[íi]tulo|dom[íi]nio|parte|module|section|chapter|domain|unit)\b/i;

// Marcadores no começo da linha: "1.", "1.2 -", "3)", "•", "-", "*", "·", "–"
const MARCADOR_INICIAL = /^\s*(?:[•*·–—-]+\s*|\d+(?:\.\d+)*\s*[.)\-:–]?\s+)/;

// Duração no fim da linha, comum em plataformas: "05:12", "(1:02:30)", "12 min", "· 8min"
const DURACAO_FINAL = /\s*[·•|-]?\s*\(?\d{1,2}:\d{2}(?::\d{2})?\)?\s*$|\s*[·•|-]?\s*\(?\d+\s*min\)?\s*$/i;

export function limparLinha(linha: string): string {
  let t = linha.replace(/\t/g, ' ').trim();
  if (!t) return '';
  if (!PALAVRAS_DE_GRUPO.test(t)) t = t.replace(MARCADOR_INICIAL, '');
  t = t.replace(DURACAO_FINAL, '');
  return t.replace(/\s{2,}/g, ' ').trim();
}

export function ehGrupo(linhaLimpa: string): boolean {
  return PALAVRAS_DE_GRUPO.test(linhaLimpa);
}

export function importarSumario(texto: string, nomePadrao: string): SumarioImportado {
  const brutas = texto.split(/\r?\n/);
  const truncado = brutas.length > LIMITE_LINHAS;
  const linhas = brutas.slice(0, LIMITE_LINHAS);

  const grupos: GrupoImportado[] = [];
  let atual: GrupoImportado | undefined;
  let ignoradas = 0;

  for (const bruta of linhas) {
    const limpa = limparLinha(bruta);
    if (!limpa || /^[.…]+$/.test(limpa)) {
      if (bruta.trim()) ignoradas++;
      continue;
    }
    if (ehGrupo(limpa)) {
      atual = { nome: limpa, topicos: [] };
      grupos.push(atual);
      continue;
    }
    if (!atual) {
      atual = { nome: nomePadrao, topicos: [] };
      grupos.push(atual);
    }
    atual.topicos.push(limpa);
  }

  const comTopicos = grupos.filter((g) => g.topicos.length > 0);
  return {
    grupos: comTopicos,
    totalTopicos: comTopicos.reduce((n, g) => n + g.topicos.length, 0),
    linhasIgnoradas: ignoradas,
    truncado,
  };
}

export function resumo(s: SumarioImportado): string {
  const t = s.totalTopicos;
  const g = s.grupos.length;
  return `${t} ${t === 1 ? 'tópico' : 'tópicos'} em ${g} ${g === 1 ? 'módulo' : 'módulos'}`;
}

// FR-018: tocar no último tópico feito marca ele e todos os anteriores.
export function marcarAte<T>(topicosEmOrdem: T[], indiceUltimoFeito: number): T[] {
  if (indiceUltimoFeito < 0) return [];
  return topicosEmOrdem.slice(0, indiceUltimoFeito + 1);
}

export function porcentagem(feitos: number, total: number): number {
  if (total <= 0) return 0;
  return Math.floor((feitos / total) * 100);
}
