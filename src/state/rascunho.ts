import { create } from 'zustand';

import type { SumarioImportado } from '@/domain/sumario';

// Estado efêmero do fluxo de começo (ADR-004): só vive enquanto a pessoa preenche.
// O que importa vai para o banco no fim da etapa 2.

export type TipoEstudo = 'certificacao' | 'curso' | 'idioma' | 'outro';

type Dados = {
  tipo: TipoEstudo;
  nome: string;
  sumario: string;
  link: string;
  // Resultado da importação pelo link (o texto colado é importado na hora, a partir de `sumario`).
  doLink: SumarioImportado | null;
  estudoId: string | null;
};

type Rascunho = Dados & {
  definir: (parcial: Partial<Dados>) => void;
  limpar: () => void;
};

const inicial: Dados = { tipo: 'certificacao', nome: '', sumario: '', link: '', doLink: null, estudoId: null };

export const useRascunho = create<Rascunho>((set) => ({
  ...inicial,
  definir: (parcial) => set(parcial),
  limpar: () => set(inicial),
}));
