import Svg, { Path } from 'react-native-svg';

import { useCores } from './useCores';

// O mascote agora é o Knob (ADR-020). Mascote fica como nome antigo para as telas existentes.
export { Knob as Mascote, type Expressao } from './Knob';

// A chegada: trilha pontilhada até a bandeira (tela de Início).
export function TrilhaComBandeira({ largura = 160 }: { largura?: number }) {
  const c = useCores();
  return (
    <Svg width={largura} height={(largura * 90) / 160} viewBox="0 0 160 90" accessibilityElementsHidden importantForAccessibility="no">
      <Path d="M8 84 C 50 92, 100 86, 128 52" fill="none" stroke={c.destaqueTinta} strokeWidth={3} strokeLinecap="round" strokeDasharray="0.1 10" opacity={0.6} />
      <Path d="M128 6v44" stroke={c.texto} strokeWidth={3.4} strokeLinecap="round" />
      <Path d="M130 8l22 7.5-22 8z" fill={c.destaque} stroke={c.destaqueTinta} strokeWidth={2.2} strokeLinejoin="round" />
    </Svg>
  );
}
