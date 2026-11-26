// Versão web (teste por link, sem instalar nada): SQLite em WebAssembly (sql.js) no navegador.
// O banco vive em memória e é salvo no localStorage depois de cada gravação.
// Mesmo schema e mesmas consultas do app; só muda o motor.

import { drizzle, type SQLJsDatabase } from 'drizzle-orm/sql-js';
import initSqlJs from 'sql.js';

import * as schema from './schema';

const CHAVE = 'rumo.db';
const ouvintes = new Set<() => void>();
let salvarAgendado = false;
let versao = 0;

// Preenchido por abrirBanco(), que roda antes de qualquer tela (preparar.web.ts).
export let db: SQLJsDatabase<typeof schema>;
export { schema };

function paraBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function deBase64(texto: string): Uint8Array {
  const s = atob(texto);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

export function versaoDoBanco(): number {
  return versao;
}

export function aoMudar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export async function abrirBanco(): Promise<import('sql.js').Database> {
  // O app pode estar num subcaminho (ex.: /app-rumo no GitHub Pages): usa o mesmo prefixo dos scripts.
  const script = [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src') ?? '').find((s) => s.includes('/_expo/'));
  const base = script ? script.slice(0, script.indexOf('/_expo/')) : '';
  const SQL = await initSqlJs({ locateFile: (arquivo) => `${base}/${arquivo}` });
  const salvo = globalThis.localStorage?.getItem(CHAVE);
  const sqlite = new SQL.Database(salvo ? deBase64(salvo) : undefined);
  sqlite.run('PRAGMA foreign_keys = ON;');

  const salvar = () => {
    salvarAgendado = false;
    try {
      globalThis.localStorage?.setItem(CHAVE, paraBase64(sqlite.export()));
    } catch {
      // armazenamento cheio ou bloqueado: segue em memória
    }
    // export() desliga as chaves estrangeiras; religa.
    sqlite.run('PRAGMA foreign_keys = ON;');
    versao++;
    ouvintes.forEach((o) => o());
  };

  db = drizzle(sqlite, {
    schema,
    logger: {
      // Toda gravação agenda um salvamento e avisa as telas, logo depois de terminar.
      logQuery(consulta) {
        if (/^\s*(insert|update|delete)/i.test(consulta) && !salvarAgendado) {
          salvarAgendado = true;
          setTimeout(salvar, 0);
        }
      },
    },
  });
  return sqlite;
}
