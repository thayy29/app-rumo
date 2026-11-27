import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { useCores } from './useCores';

export type Expressao = 'neutro' | 'feliz' | 'calmo';

const TRACOS = 11;
const ABERTURA = 135; // o knob gira de -135° a +135°, como um potenciômetro de verdade

function ponto(angulo: number, raio: number) {
  const rad = (angulo * Math.PI) / 180;
  return { x: 50 + Math.sin(rad) * raio, y: 52 - Math.cos(rad) * raio };
}

// Knob, o mascote (ADR-020): um potenciômetro com rosto. O ponteiro e o anel mostram
// quanto da track já andou (valor de 0 a 1), na cor da fase.
export function Knob({ tamanho = 64, expressao = 'neutro', valor = 0, cor }: { tamanho?: number; expressao?: Expressao; valor?: number; cor?: string }) {
  const c = useCores();
  const v = Math.max(0, Math.min(1, valor));
  const aceso = cor ?? c.acao;
  const angulo = -ABERTURA + 2 * ABERTURA * v;
  const p1 = ponto(angulo, 20);
  const p2 = ponto(angulo, 26.5);
  const olho = c.mascoteOlho;
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no">
      <Rect x={35} y={84} width={11} height={8} rx={4} fill={c.mascote} />
      <Rect x={54} y={84} width={11} height={8} rx={4} fill={c.mascote} />
      {Array.from({ length: TRACOS }, (_, i) => {
        const a = -ABERTURA + (2 * ABERTURA * i) / (TRACOS - 1);
        const de = ponto(a, 40.5);
        const ate = ponto(a, 46);
        const ligado = v > 0 && i / (TRACOS - 1) <= v + 0.001;
        return <Line key={i} x1={de.x} y1={de.y} x2={ate.x} y2={ate.y} stroke={ligado ? aceso : c.linha} strokeWidth={3.2} strokeLinecap="round" />;
      })}
      <Circle cx={50} cy={52} r={35} fill={c.mascote} />
      <Circle cx={50} cy={52} r={28} fill={c.mascote2} />
      <Ellipse cx={50} cy={33} rx={13} ry={4.5} fill="#FFFFFF" opacity={0.45} />
      <Line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={aceso} strokeWidth={4.2} strokeLinecap="round" />
      <Circle cx={37.5} cy={58} r={3.4} fill={c.bochecha} />
      <Circle cx={62.5} cy={58} r={3.4} fill={c.bochecha} />
      <G>
        {expressao === 'feliz' ? (
          <>
            <Path d="M39.5 52.5q3.5-5 7 0M53.5 52.5q3.5-5 7 0" fill="none" stroke={olho} strokeWidth={3} strokeLinecap="round" />
            <Path d="M44 58.5q6 7.5 12 0z" fill={olho} stroke={olho} strokeWidth={1.5} strokeLinejoin="round" />
          </>
        ) : expressao === 'calmo' ? (
          <>
            <Path d="M39.5 51.5h7M53.5 51.5h7" stroke={olho} strokeWidth={3} strokeLinecap="round" />
            <Path d="M46.5 59.5q3.5 3 7 0" fill="none" stroke={olho} strokeWidth={2.6} strokeLinecap="round" />
          </>
        ) : (
          <>
            <Ellipse cx={43} cy={51} rx={3.2} ry={4} fill={olho} />
            <Ellipse cx={57} cy={51} rx={3.2} ry={4} fill={olho} />
            <Circle cx={44.2} cy={49.6} r={1.1} fill="#FFFFFF" />
            <Circle cx={58.2} cy={49.6} r={1.1} fill="#FFFFFF" />
            <Path d="M45.5 59q4.5 4 9 0" fill="none" stroke={olho} strokeWidth={2.6} strokeLinecap="round" />
          </>
        )}
      </G>
    </Svg>
  );
}
