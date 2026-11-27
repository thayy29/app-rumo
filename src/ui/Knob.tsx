import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Upgrade } from '@/domain/nivel';

import { corDaFase } from './tokens';
import { useCores } from './useCores';

export type Expressao = 'neutro' | 'feliz' | 'calmo';

const ABERTURA = 135; // o knob gira de -135° a +135°, como um potenciômetro de verdade
const ORDEM: Upgrade[] = ['nenhum', 'anel', 'leds', 'ouro', 'fones', 'coroa'];
const OURO = '#E9C25B';
const CORES_FASE = Object.values(corDaFase);

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
// quanto da track já andou (valor de 0 a 1). O equipamento evolui com as tracks terminadas:
// anel colorido, LEDs, tampa dourada, fones e coroa de VU meter.
export function Knob({
  tamanho = 64,
  expressao = 'neutro',
  valor = 0,
  cor,
  upgrade = 'nenhum',
}: {
  tamanho?: number;
  expressao?: Expressao;
  valor?: number;
  cor?: string;
  upgrade?: Upgrade;
}) {
  const c = useCores();
  const v = Math.max(0, Math.min(1, valor));
  const tem = (u: Upgrade) => ORDEM.indexOf(upgrade) >= ORDEM.indexOf(u);
  const aceso = cor ?? c.acao;
  const angulo = -ABERTURA + 2 * ABERTURA * v;
  const p1 = ponto(angulo, 20);
  const p2 = ponto(angulo, 26.5);
  const olho = c.mascoteOlho;
  const tampa = tem('ouro') ? OURO : c.mascote2;
  const passo = (2 * ABERTURA) / CORES_FASE.length;

  return (
    <Svg width={tamanho} height={tamanho} viewBox="-8 -16 116 116" accessibilityElementsHidden importantForAccessibility="no">
      {tem('coroa') ? (
        <G>
          {[-14, -7, 0, 7, 14].map((dx, i) => {
            const h = [8, 12, 16, 12, 8][i]!;
            return <Rect key={dx} x={50 + dx - 2.6} y={-6 - h} width={5.2} height={h} rx={1.6} fill={i === 2 ? c.alerta : i % 2 ? c.acao : '#9BDB5C'} />;
          })}
          <Rect x={33} y={-6} width={34} height={3.5} rx={1.75} fill={OURO} />
        </G>
      ) : null}
      {tem('fones') ? (
        <G>
          <Path d="M10 52C10 18 90 18 90 52" fill="none" stroke={c.mascote} strokeWidth={6} strokeLinecap="round" />
          <Path d="M10 52C10 18 90 18 90 52" fill="none" stroke={c.linha} strokeWidth={1.5} strokeLinecap="round" />
          <Rect x={2} y={42} width={13} height={24} rx={6} fill={c.mascote} stroke={aceso} strokeWidth={2} />
          <Rect x={85} y={42} width={13} height={24} rx={6} fill={c.mascote} stroke={aceso} strokeWidth={2} />
        </G>
      ) : null}

      <Rect x={35} y={84} width={11} height={8} rx={4} fill={c.mascote} />
      <Rect x={54} y={84} width={11} height={8} rx={4} fill={c.mascote} />

      {tem('anel') ? (
        // Anel colorido: um gomo por fase, aceso até onde a track chegou.
        CORES_FASE.map((cf, i) => {
          const de = -ABERTURA + i * passo;
          return (
            <Path
              key={cf}
              d={arco(de + 1.5, de + passo - 1.5, 42)}
              fill="none"
              stroke={cf}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={de + passo / 2 <= angulo ? 1 : 0.3}
            />
          );
        })
      ) : (
        <>
          <Path d={arco(-ABERTURA, ABERTURA, 42)} fill="none" stroke={c.celula2} strokeWidth={5} strokeLinecap="round" />
          {v > 0 ? <Path d={arco(-ABERTURA, angulo, 42)} fill="none" stroke={aceso} strokeWidth={5} strokeLinecap="round" /> : null}
        </>
      )}

      {tem('leds')
        ? Array.from({ length: 9 }, (_, i) => {
            const p = ponto(-120 + i * 30, 48.5);
            return <Circle key={i} cx={p.x} cy={p.y} r={1.9} fill={i / 8 <= v ? aceso : c.acao} opacity={i / 8 <= v ? 1 : 0.45} />;
          })
        : null}

      <Circle cx={50} cy={52} r={35} fill={c.mascote} stroke={c.linha} strokeWidth={1} />
      <Circle cx={50} cy={52} r={28} fill={tampa} />
      <Ellipse cx={50} cy={33} rx={13} ry={4.5} fill="#FFFFFF" opacity={tem('ouro') ? 0.6 : 0.45} />
      <Line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={tem('ouro') ? c.mascoteOlho : aceso} strokeWidth={4.2} strokeLinecap="round" />
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
