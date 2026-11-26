import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '../../drizzle/migrations';
import { db } from './db';

// Abre e migra o banco antes de qualquer tela (ADR-002). Na web: preparar.web.ts.
export function useBancoPronto(): { pronto: boolean; erro?: Error } {
  const { success, error } = useMigrations(db, migrations);
  return { pronto: success, erro: error };
}
