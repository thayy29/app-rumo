import { cores, type Cores } from './tokens';

// O estúdio é sempre escuro (ADR-020): a mesma paleta no claro e no escuro do sistema.
export function useCores(): Cores {
  return cores.estudio;
}
