import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { useCores } from './useCores';

export type Expressao = 'neutro' | 'feliz' | 'calmo';

// O ponto do logotipo, vivo. Convertido do canvas (viewBox 100x100).
export function Mascote({ tamanho = 60, expressao = 'neutro' }: { tamanho?: number; expressao?: Expressao }) {
  const c = useCores();
  const olho = c.mascoteOlho;
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no">
      <Rect x={33} y={82} width={13} height={10} rx={5} fill={c.mascote2} />
      <Rect x={56} y={82} width={13} height={10} rx={5} fill={c.mascote2} />
      <Path d="M57 22c3-9 11-13 17-9" fill="none" stroke={c.mascote} strokeWidth={5.5} strokeLinecap="round" />
      <Ellipse cx={50} cy={54} rx={35} ry={33} fill={c.mascote} />
      <Ellipse cx={34} cy={62} rx={6} ry={4} fill="#FFFFFF" opacity={0.28} />
      <Ellipse cx={80} cy={62} rx={5} ry={4} fill="#FFFFFF" opacity={0.28} />
      {expressao === 'feliz' ? (
        <>
          <Path d="M41 51c2-6 9-6 11 0M62 51c2-6 9-6 11 0" fill="none" stroke={olho} strokeWidth={4} strokeLinecap="round" />
          <Path d="M51 61c3 6 11 6 14 0" fill="none" stroke={olho} strokeWidth={3.2} strokeLinecap="round" />
        </>
      ) : expressao === 'calmo' ? (
        <>
          <Path d="M42 51h10M63 51h10" stroke={olho} strokeWidth={4} strokeLinecap="round" />
          <Path d="M54 62c2 2.6 6 2.6 8 0" fill="none" stroke={olho} strokeWidth={3} strokeLinecap="round" />
        </>
      ) : (
        <>
          <Ellipse cx={47} cy={50} rx={4.6} ry={5.8} fill={olho} />
          <Ellipse cx={68} cy={50} rx={4.6} ry={5.8} fill={olho} />
          <Circle cx={48.8} cy={47.8} r={1.7} fill="#FFFFFF" />
          <Circle cx={69.8} cy={47.8} r={1.7} fill="#FFFFFF" />
          <Path d="M54 62c2 2.6 6 2.6 8 0" fill="none" stroke={olho} strokeWidth={3} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

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
