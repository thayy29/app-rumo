// Leitura de WAV sem dependências: cabeçalho e estatística por blocos, lendo os bytes uma vez.
// Não guarda as amostras: um WAV de 6 minutos tem dezenas de MB.

export type InfoWav = { taxa: number; canais: number; bits: number; flutuante: boolean; inicio: number; tamanho: number };

export class WavInvalido extends Error {}

function texto(v: DataView, i: number, n: number): string {
  let s = '';
  for (let k = 0; k < n; k++) s += String.fromCharCode(v.getUint8(i + k));
  return s;
}

export function lerCabecalho(bytes: Uint8Array): InfoWav {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 44 || texto(v, 0, 4) !== 'RIFF' || texto(v, 8, 4) !== 'WAVE') throw new WavInvalido('Não parece um arquivo WAV.');
  let i = 12;
  let fmt: Omit<InfoWav, 'inicio' | 'tamanho'> | null = null;
  while (i + 8 <= bytes.byteLength) {
    const id = texto(v, i, 4);
    const tam = v.getUint32(i + 4, true);
    const corpo = i + 8;
    if (id === 'fmt ') {
      let formato = v.getUint16(corpo, true);
      const canais = v.getUint16(corpo + 2, true);
      const taxa = v.getUint32(corpo + 4, true);
      const bits = v.getUint16(corpo + 14, true);
      if (formato === 0xfffe && tam >= 26) formato = v.getUint16(corpo + 24, true); // WAVE_FORMAT_EXTENSIBLE
      const flutuante = formato === 3;
      if (!(formato === 1 || flutuante) || ![16, 24, 32].includes(bits) || canais < 1 || taxa < 8000) {
        throw new WavInvalido('Formato de WAV não suportado. Exporte em PCM 16 ou 24 bits.');
      }
      fmt = { taxa, canais, bits, flutuante };
    } else if (id === 'data') {
      if (!fmt) throw new WavInvalido('WAV sem cabeçalho de formato.');
      return { ...fmt, inicio: corpo, tamanho: Math.min(tam, bytes.byteLength - corpo) };
    }
    i = corpo + tam + (tam % 2);
  }
  throw new WavInvalido('WAV sem áudio.');
}

// Um bloco curto de áudio: energia média (quadrado médio) e pico absoluto, de 0 a 1.
export type Bloco = { energia: number; pico: number };

export function medirBlocos(bytes: Uint8Array, info: InfoWav, blocoSeg = 0.1): Bloco[] {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const passo = info.bits / 8;
  const quadro = passo * info.canais;
  const quadros = Math.floor(info.tamanho / quadro);
  const porBloco = Math.max(1, Math.round(info.taxa * blocoSeg));
  const blocos: Bloco[] = [];
  let soma = 0;
  let pico = 0;
  let n = 0;
  for (let q = 0; q < quadros; q++) {
    const base = info.inicio + q * quadro;
    for (let c = 0; c < info.canais; c++) {
      const p = base + c * passo;
      let x: number;
      if (info.flutuante) x = v.getFloat32(p, true);
      else if (info.bits === 16) x = v.getInt16(p, true) / 32768;
      else if (info.bits === 24) {
        const b = v.getUint8(p) | (v.getUint8(p + 1) << 8) | (v.getInt8(p + 2) << 16);
        x = b / 8388608;
      } else x = v.getInt32(p, true) / 2147483648;
      soma += x * x;
      const a = Math.abs(x);
      if (a > pico) pico = a;
    }
    n++;
    if (n === porBloco) {
      blocos.push({ energia: soma / (n * info.canais), pico });
      soma = 0;
      pico = 0;
      n = 0;
    }
  }
  if (n > porBloco / 2) blocos.push({ energia: soma / (n * info.canais), pico });
  return blocos;
}
