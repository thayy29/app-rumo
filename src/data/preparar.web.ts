import { useEffect, useState } from 'react';

import migrations from '../../drizzle/migrations';
import { abrirBanco } from './db.web';

// Na web: carrega o SQLite em WebAssembly e aplica as migrações que ainda não rodaram.
async function preparar() {
  const sqlite = await abrirBanco();
  sqlite.run('CREATE TABLE IF NOT EXISTS __migracoes (tag TEXT PRIMARY KEY, em INTEGER NOT NULL)');
  const feitas = new Set((sqlite.exec('SELECT tag FROM __migracoes')[0]?.values ?? []).map((v) => String(v[0])));
  migrations.journal.entries.forEach((entrada, i) => {
    if (feitas.has(entrada.tag)) return;
    const sql = (migrations.migrations as Record<string, string>)[`m${String(i).padStart(4, '0')}`] ?? '';
    sqlite.run('BEGIN');
    try {
      sql.split('--> statement-breakpoint').forEach((parte) => parte.trim() && sqlite.run(parte));
      sqlite.run('INSERT INTO __migracoes (tag, em) VALUES (?, ?)', [entrada.tag, Date.now()]);
      sqlite.run('COMMIT');
    } catch (e) {
      sqlite.run('ROLLBACK');
      throw e;
    }
  });
}

let promessa: Promise<void> | null = null;

export function useBancoPronto(): { pronto: boolean; erro?: Error } {
  const [estado, setEstado] = useState<{ pronto: boolean; erro?: Error }>({ pronto: false });
  useEffect(() => {
    promessa ??= preparar();
    promessa.then(
      () => setEstado({ pronto: true }),
      (e: unknown) => setEstado({ pronto: false, erro: e instanceof Error ? e : new Error(String(e)) }),
    );
  }, []);
  return estado;
}
