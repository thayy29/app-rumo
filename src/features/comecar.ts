import { asc, desc, eq, isNull } from 'drizzle-orm';
import { Platform } from 'react-native';

import { db, schema } from '@/data/db';
import { extrairGuiaMicrosoft, normalizarLinkGuia } from '@/domain/guiaMicrosoft';
import { extrairDaPagina } from '@/domain/pagina';
import { marcarAte, type SumarioImportado } from '@/domain/sumario';
import { novoId } from '@/platform/id';
import { baixarPagina } from '@/platform/rede';
import type { TipoEstudo } from '@/state/rascunho';

// Casos de uso do começo (EPIC-001). Cada ação é uma transação (ADR-002).

const { estudo, grupo, topico } = schema;

// FR-001 + FR-002: grava o estudo com os grupos e tópicos importados.
// Se a pessoa voltou da etapa 3 e mudou o sumário, o estudo anterior é substituído.
export function salvarEstudo(entrada: {
  tipo: TipoEstudo;
  nome: string;
  importado: SumarioImportado;
  substituirId?: string | null;
}): { estudoId: string } {
  const estudoId = novoId();
  const agora = Date.now();
  db.transaction((tx) => {
    if (entrada.substituirId) tx.delete(estudo).where(eq(estudo.id, entrada.substituirId)).run();
    tx.insert(estudo).values({ id: estudoId, nome: entrada.nome, tipo: entrada.tipo, criadoEm: agora }).run();
    entrada.importado.grupos.forEach((g, gi) => {
      const grupoId = novoId();
      tx.insert(grupo).values({ id: grupoId, estudoId, ordem: gi, nome: g.nome }).run();
      g.topicos.forEach((t, ti) => {
        const detalhes = t.detalhes.length > 0 ? JSON.stringify(t.detalhes) : null;
        tx.insert(topico).values({ id: novoId(), grupoId, ordem: ti, texto: t.texto, detalhes }).run();
      });
    });
  });
  return { estudoId };
}

export type ResultadoLink = { ok: true; sumario: SumarioImportado } | { ok: false; mensagem: string };

const MENSAGENS = {
  SEM_SUMARIO:
    'Não achei a lista de aulas nessa página. Alguns sites só mostram as aulas depois do login. Abra o curso, copie a lista de aulas e cole aqui.',
  NA_WEB: 'Na versão pelo navegador eu ainda não consigo ler links. Cole a lista de aulas, ou só escreva o seu próximo passo.',
  SEM_INTERNET: 'Não consegui abrir esse link agora. Confira a internet e tente de novo, ou cole a lista de aulas.',
} as const;

// ADR-014: baixa a página que a pessoa colou e organiza o conteúdo no aparelho.
// Guias de certificação Microsoft têm leitura própria (áreas, subtemas e objetivos); o resto usa a leitura geral.
export async function importarPorLink(link: string, nomePadrao?: string): Promise<ResultadoLink> {
  // O navegador bloqueia a leitura de páginas de outros sites (CORS); só o app instalado lê links.
  if (Platform.OS === 'web') return { ok: false, mensagem: MENSAGENS.NA_WEB };
  const guia = normalizarLinkGuia(link);
  const url = guia.ok ? guia.url : link;
  let html: string;
  try {
    html = await baixarPagina(url);
  } catch (e) {
    const status = e instanceof Error ? Number(e.message.replace('HTTP ', '')) : 0;
    return { ok: false, mensagem: status >= 400 && status < 500 ? MENSAGENS.SEM_SUMARIO : MENSAGENS.SEM_INTERNET };
  }
  if (guia.ok) {
    const lido = extrairGuiaMicrosoft(html);
    if (lido.ok) return { ok: true, sumario: lido.sumario };
  }
  const lido = extrairDaPagina(html, nomePadrao);
  return lido.ok ? { ok: true, sumario: lido.sumario } : { ok: false, mensagem: MENSAGENS.SEM_SUMARIO };
}

// Consulta base: tópicos do estudo na ordem do sumário (módulo, depois tópico).
export function consultaTopicos(estudoId: string) {
  return db
    .select({
      id: topico.id,
      texto: topico.texto,
      detalhes: topico.detalhes,
      feitoEm: topico.feitoEm,
      ondeParei: topico.ondeParei,
      grupoId: grupo.id,
      grupo: grupo.nome,
    })
    .from(topico)
    .innerJoin(grupo, eq(topico.grupoId, grupo.id))
    .where(eq(grupo.estudoId, estudoId))
    .orderBy(asc(grupo.ordem), asc(topico.ordem));
}

export function lerDetalhes(json: string | null): string[] {
  if (!json) return [];
  try {
    const v: unknown = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

// FR-018: tocar no último tópico feito marca ele e todos os anteriores; o resto volta a "a fazer".
export function marcarAteOTopico(estudoId: string, indice: number): void {
  const todos = consultaTopicos(estudoId).all();
  const feitos = new Set(marcarAte(todos, indice).map((t) => t.id));
  const agora = Date.now();
  db.transaction((tx) => {
    for (const t of todos) {
      const feitoEm = feitos.has(t.id) ? (t.feitoEm ?? agora) : null;
      if (feitoEm !== t.feitoEm) tx.update(topico).set({ feitoEm }).where(eq(topico.id, t.id)).run();
    }
  });
}

// R1: um projeto ativo por vez. Começar outro arquiva o atual; nada é apagado.
export function arquivarEstudo(estudoId: string): void {
  db.update(estudo).set({ arquivadoEm: Date.now() }).where(eq(estudo.id, estudoId)).run();
}

// O projeto que aparece no Hoje: o mais recente que não foi arquivado.
export function consultaEstudoAtivo() {
  return db.select().from(estudo).where(isNull(estudo.arquivadoEm)).orderBy(desc(estudo.criadoEm)).limit(1);
}
