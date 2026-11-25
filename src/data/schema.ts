import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Instantes em milissegundos UTC (*_em). IDs em UUID. Ver architecture.md, ADR-006.

export const estudo = sqliteTable('estudo', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  tipo: text('tipo', { enum: ['certificacao', 'curso', 'idioma', 'outro'] }).notNull(),
  criadoEm: integer('criado_em').notNull(),
});

export const grupo = sqliteTable('grupo', {
  id: text('id').primaryKey(),
  estudoId: text('estudo_id')
    .notNull()
    .references(() => estudo.id, { onDelete: 'cascade' }),
  ordem: integer('ordem').notNull(),
  nome: text('nome').notNull(),
});

export const topico = sqliteTable('topico', {
  id: text('id').primaryKey(),
  grupoId: text('grupo_id')
    .notNull()
    .references(() => grupo.id, { onDelete: 'cascade' }),
  ordem: integer('ordem').notNull(),
  texto: text('texto').notNull(),
  // "O que estudar": objetivos do guia de certificação, em JSON (lista de textos).
  detalhes: text('detalhes'),
  feitoEm: integer('feito_em'),
});

export const bloco = sqliteTable('bloco', {
  id: text('id').primaryKey(),
  topicoId: text('topico_id').references(() => topico.id, { onDelete: 'set null' }),
  iniciadoEm: integer('iniciado_em').notNull(),
  duracaoMs: integer('duracao_ms').notNull(),
  pausadoTotalMs: integer('pausado_total_ms').notNull().default(0),
  pausadoEm: integer('pausado_em'),
  notificacaoId: text('notificacao_id'),
  encerradoEm: integer('encerrado_em'),
});

export type Bloco = typeof bloco.$inferSelect;
