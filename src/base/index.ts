import { ESTILO } from './estilos';
import { FASE } from './fases';
import { ARRANJO } from './tarefas/arranjo';
import { AUTOMACAO } from './tarefas/automacao';
import { EXPORT } from './tarefas/export';
import { IDEIA } from './tarefas/ideia';
import { LOOP } from './tarefas/loop';
import { MASTER } from './tarefas/master';
import { MIX } from './tarefas/mix';
import { VIDA } from './tarefas/vida';
import type { TarefaBase } from './tipos';

export * from './tipos';
export { ESTILO, FASE };

// A base inteira, já na ordem das fases.
export const TAREFAS: readonly TarefaBase[] = [...IDEIA, ...LOOP, ...ARRANJO, ...VIDA, ...AUTOMACAO, ...MIX, ...MASTER, ...EXPORT];
