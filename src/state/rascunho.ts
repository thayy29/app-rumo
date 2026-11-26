import { create } from 'zustand';

import type { SumarioImportado } from '@/domain/sumario';

// Estado efêmero do fluxo de começo (ADR-004): só vive enquanto a pessoa preenche.
// O que importa vai para o banco no fim da etapa 2.

export type TipoEstudo = 'certificacao' | 'curso' | 'idioma' | 'outro';

type Dados = {
  tipo: TipoEstudo;
  nome: string;
  sumario: string;
  // `sumario` é o que a pessoa colou: link ou texto. Quando é link, guarda o resultado da leitura
  // e de qual link ele veio, para não baixar de novo a cada renderização.
  doLink: SumarioImportado | null;
  linkLido: string;
  estudoId: string | null;
};

type Rascunho = Dados & {
  definir: (parcial: Partial<Dados>) => void;
  limpar: () => void;
};

const inicial: Dados = { tipo: 'certificacao', nome: '', sumario: '', doLink: null, linkLido: '', estudoId: null };

export const useRascunho = create<Rascunho>((set) => ({
  ...inicial,
  definir: (parcial) => set(parcial),
  limpar: () => set(inicial),
}));
