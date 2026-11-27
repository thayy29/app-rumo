import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { useCores } from './useCores';

export type Expressao = 'neutro' | 'feliz' | 'calmo';

const ABERTURA = 135; // o knob gira de -135° a +135°, como um potenciômetro de verdade

function ponto(angulo: number, raio: number) {
  const rad = (angulo * Math.PI) / 180;
  return { x: 50 + Math.sin(rad) * raio, y: 52 - Math.cos(rad) * raio };
}

// Arco do anel de valor, de um ângulo a outro (0° = para cima, sentido horário).
function arco(de: number, ate: number, raio: number) {
  const a = ponto(de, raio);
  const b = ponto(ate, raio);
  const grande = ate - de > 180 ? 1 : 0;
  return `M${a.x} ${a.y}A${raio} ${raio} 0 ${grande} 1 ${b.x} ${b.y}`;
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
      <Path d={arco(-ABERTURA, ABERTURA, 42)} fill="none" stroke={c.celula2} strokeWidth={5} strokeLinecap="round" />
      {v > 0 ? <Path d={arco(-ABERTURA, angulo, 42)} fill="none" stroke={aceso} strokeWidth={5} strokeLinecap="round" /> : null}
      <Circle cx={50} cy={52} r={35} fill={c.mascote} stroke={c.linha} strokeWidth={1} />
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
