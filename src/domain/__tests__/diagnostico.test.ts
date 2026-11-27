import { diagnosticar, medir } from '@/domain/diagnostico';
import { lerCabecalho, medirBlocos, WavInvalido } from '@/domain/wav';

// Gera um WAV PCM com trechos de amplitude diferente (uma senoide por trecho).
function wav(trechos: { seg: number; amp: number }[], { taxa = 8000, canais = 2, bits = 16 } = {}): Uint8Array {
  const quadros = trechos.reduce((s, t) => s + Math.round(t.seg * taxa), 0);
  const passo = bits / 8;
  const dados = quadros * canais * passo;
  const b = new Uint8Array(44 + dados);
  const v = new DataView(b.buffer);
  const str = (i: number, s: string) => [...s].forEach((ch, k) => v.setUint8(i + k, ch.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + dados, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, canais, true);
  v.setUint32(24, taxa, true);
  v.setUint32(28, taxa * canais * passo, true);
  v.setUint16(32, canais * passo, true);
  v.setUint16(34, bits, true);
  str(36, 'data');
  v.setUint32(40, dados, true);
  let p = 44;
  let n = 0;
  for (const t of trechos) {
    for (let q = 0; q < Math.round(t.seg * taxa); q++, n++) {
      const x = t.amp * Math.sin((2 * Math.PI * 110 * n) / taxa);
      for (let c = 0; c < canais; c++, p += passo) {
        if (bits === 16) v.setInt16(p, Math.max(-32768, Math.min(32767, Math.round(x * 32767))), true);
        else {
          const i = Math.max(-8388608, Math.min(8388607, Math.round(x * 8388607)));
          v.setUint8(p, i & 0xff);
          v.setUint8(p + 1, (i >> 8) & 0xff);
          v.setInt8(p + 2, i >> 16);
        }
      }
    }
  }
  return b;
}

const analisar = (b: Uint8Array) => diagnosticar(medir(medirBlocos(b, lerCabecalho(b))));

// Uma track de pista: intro, groove, build, drop, break, drop, outro.
const arranjada = (amp: (base: number) => number) =>
  [0.15, 0.3, 0.2, 0.8, 0.15, 0.3, 0.9, 0.5, 0.15, 0.3, 0.8, 0.2, 0.9, 0.3, 0.12].map((a) => ({ seg: 20, amp: amp(a) }));

describe('lerCabecalho', () => {
  it('lê formato, canais e onde começa o áudio, em 16 e 24 bits', () => {
    expect(lerCabecalho(wav([{ seg: 1, amp: 0.5 }]))).toMatchObject({ taxa: 8000, canais: 2, bits: 16, inicio: 44 });
    expect(lerCabecalho(wav([{ seg: 1, amp: 0.5 }], { bits: 24, canais: 1 }))).toMatchObject({ bits: 24, canais: 1 });
  });
  it('recusa o que não é WAV', () => {
    expect(() => lerCabecalho(new Uint8Array(100))).toThrow(WavInvalido);
  });
});

describe('diagnóstico', () => {
  it('trecho curto é loop', () => {
    expect(analisar(wav([{ seg: 30, amp: 0.5 }])).fase).toBe('loop');
  });

  it('loop duplicado por minutos é arranjo cru', () => {
    expect(analisar(wav([{ seg: 300, amp: 0.5 }])).fase).toBe('arranjo');
  });

  it('track com seções que clipa vai para a mix', () => {
    const d = analisar(wav(arranjada((a) => Math.min(1, a * 1.25))));
    expect(d.fase).toBe('mix');
    expect(d.metricas.pontosClipando).toBeGreaterThan(0);
  });

  it('track com seções e volume baixo vai para a master', () => {
    const d = analisar(wav(arranjada((a) => a * 0.15)));
    expect(d.fase).toBe('master');
    expect(d.metricas.volumeLufs).toBeLessThan(-16);
  });

  it('track com seções, sem clipar e com volume alto está pronta para exportar', () => {
    expect(analisar(wav(arranjada((a) => a * 1.05), { bits: 24 })).fase).toBe('export');
  });
});
