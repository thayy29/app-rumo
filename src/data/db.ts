import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

// enableChangeListener: necessário para o useLiveQuery atualizar a tela.
const expo = openDatabaseSync('rumo.db', { enableChangeListener: true });

// WAL deixa a gravação segura contra fechamento forçado; chaves estrangeiras ligadas.
expo.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

export const db = drizzle(expo, { schema });
export { schema };
