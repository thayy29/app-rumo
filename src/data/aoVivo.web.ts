import { useMemo, useSyncExternalStore } from 'react';

import { aoMudar, versaoDoBanco } from './db.web';

type Consulta<T> = { all: () => T };

// Na web: roda a consulta de novo sempre que houver gravação no banco.
export function useAoVivo<T>(consulta: Consulta<T>, deps: unknown[] = []): { data: T } {
  const versao = useSyncExternalStore(aoMudar, versaoDoBanco);
  const chave = JSON.stringify(deps);
  // A consulta é recriada a cada render; o que decide rodar de novo é a versão do banco e os parâmetros.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => consulta.all(), [versao, chave]);
  return { data };
}
