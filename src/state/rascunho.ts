import { create } from 'zustand';

// Estado efêmero do fluxo de começo (ADR-004): só vive enquanto a pessoa preenche.
// O que importa vai para o banco no fim da etapa 2.

export type TipoEstudo = 'certificacao' | 'curso' | 'idioma' | 'outro';

type Rascunho = {
  tipo: TipoEstudo;
  nome: string;
  sumario: string;
  estudoId: string | null;
  definir: (parcial: Partial<Omit<Rascunho, 'definir' | 'limpar'>>) => void;
  limpar: () => void;
};

const inicial = { tipo: 'certificacao' as TipoEstudo, nome: '', sumario: '', estudoId: null };

export const useRascunho = create<Rascunho>((set) => ({
  ...inicial,
  definir: (parcial) => set(parcial),
  limpar: () => set(inicial),
}));
