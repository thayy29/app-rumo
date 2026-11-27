import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { ESTILOS, FASES } from '@/base';

// Instantes em milissegundos UTC (*_em). IDs em UUID. Domínio track → fase → tarefa (ADR-017).

export const track = sqliteTable('track', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  estilo: text('estilo', { enum: ESTILOS }).notNull(),
  bpm: integer('bpm').notNull(),
  tom: text('tom'),
  destino: text('destino', { enum: ['pista', 'streaming'] }).notNull().default('pista'),
  faseAtual: text('fase_atual', { enum: FASES }).notNull(),
  criadaEm: integer('criada_em').notNull(),
  // A track aberta no Hoje é a escolhida por último (FR-030).
  escolhidaEm: integer('escolhida_em').notNull(),
  terminadaEm: integer('terminada_em'),
  arquivadaEm: integer('arquivada_em'),
});

// Cópia da base para a track: a pessoa pode editar, pular e acrescentar sem mexer na base.
export const tarefa = sqliteTable('tarefa', {
  id: text('id').primaryKey(),
  trackId: text('track_id')
    .notNull()
    .references(() => track.id, { onDelete: 'cascade' }),
  fase: text('fase', { enum: FASES }).notNull(),
  ordem: integer('ordem').notNull(),
  baseId: text('base_id'), // null: tarefa criada pela pessoa
  tipo: text('tipo', { enum: ['tarefa', 'cardapio'] }).notNull().default('tarefa'),
  texto: text('texto').notNull(),
  prontoQuando: text('pronto_quando'),
  versaoFeia: text('versao_feia'),
  grupo: text('grupo'),
  secao: text('secao'),
  parametro: text('parametro'),
  escolhida: integer('escolhida', { mode: 'boolean' }).notNull().default(true),
  feitaEm: integer('feita_em'),
  ondeParei: text('onde_parei'),
});

export const bloco = sqliteTable('bloco', {
  id: text('id').primaryKey(),
  trackId: text('track_id').references(() => track.id, { onDelete: 'cascade' }),
  tarefaId: text('tarefa_id').references(() => tarefa.id, { onDelete: 'set null' }),
  // completo: 25 min; feia: a versão feia em 10 min; retomada: o passo de volta em 10 min.
  modo: text('modo', { enum: ['completo', 'feia', 'retomada'] }).notNull().default('completo'),
  iniciadoEm: integer('iniciado_em').notNull(),
  duracaoMs: integer('duracao_ms').notNull(),
  pausadoTotalMs: integer('pausado_total_ms').notNull().default(0),
  pausadoEm: integer('pausado_em'),
  notificacaoId: text('notificacao_id'),
  encerradoEm: integer('encerrado_em'),
  resposta: text('resposta', { enum: ['terminei', 'continua'] }),
});

export type Track = typeof track.$inferSelect;
export type Tarefa = typeof tarefa.$inferSelect;
export type Bloco = typeof bloco.$inferSelect;
export type ModoBloco = Bloco['modo'];
