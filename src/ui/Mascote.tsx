import { useNivel } from '@/features/useNivel';

import { Knob, type Expressao } from './Knob';

export type { Expressao };

// O mascote é o Knob (ADR-020), vestido com o equipamento do nível atual.
export function Mascote(props: { tamanho?: number; expressao?: Expressao; valor?: number; cor?: string }) {
  const { nivel } = useNivel();
  return <Knob {...props} upgrade={nivel.upgrade} />;
}
