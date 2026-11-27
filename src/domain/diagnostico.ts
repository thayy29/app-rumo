import type { Fase } from '@/base';

import type { Bloco } from './wav';

// Diagnóstico de onde a track está, a partir do áudio (sem IA): duração, volume, picos e
// quanto a energia muda ao longo da música. É uma estimativa; a pessoa confirma.

export type Metricas = {
  duracaoSeg: number;
  picoDb: number;
  pontosClipando: number;
  volumeLufs: number; // aproximado: sem a ponderação K do padrão
  variacaoDb: number; // diferença entre as partes mais cheias e as mais vazias
  mudancas: number; // viradas de energia entre trechos de 8 segundos
};

export type Diagnostico = { fase: Fase; motivos: string[]; metricas: Metricas };

const db = (energia: number) => (energia > 0 ? 10 * Math.log10(energia) : -120);

function percentil(valores: number[], p: number): number {
  if (valores.length === 0) return -120;
  const v = [...valores].sort((a, b) => a - b);
  return v[Math.min(v.length - 1, Math.max(0, Math.round((p / 100) * (v.length - 1))))]!;
}

// Média de energia em janelas de N blocos.
function janelas(blocos: Bloco[], n: number): number[] {
  const r: number[] = [];
  for (let i = 0; i + n <= blocos.length; i += n) {
    let s = 0;
    for (let k = i; k < i + n; k++) s += blocos[k]!.energia;
    r.push(s / n);
  }
  return r;
}

export function medir(blocos: Bloco[], blocoSeg = 0.1): Metricas {
  const duracaoSeg = blocos.length * blocoSeg;
  const pico = blocos.reduce((m, b) => Math.max(m, b.pico), 0);
  const pontosClipando = blocos.filter((b) => b.pico >= 0.999).length;

  // Volume integrado com portas de silêncio, como o LUFS faz (janelas de 400 ms).
  const j400 = janelas(blocos, Math.max(1, Math.round(0.4 / blocoSeg))).filter((e) => db(e) > -70);
  const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const porta = db(media(j400)) - 10;
  const volumeLufs = Math.round((db(media(j400.filter((e) => db(e) > porta))) - 0.691) * 10) / 10;

  // Energia em trechos de 8 s (cerca de 4 compassos a 120 BPM), ignorando silêncio.
  const trechos = janelas(blocos, Math.max(1, Math.round(8 / blocoSeg)))
    .map(db)
    .filter((x) => x > -60);
  const variacaoDb = Math.round((percentil(trechos, 90) - percentil(trechos, 10)) * 10) / 10;
  let mudancas = 0;
  for (let i = 1; i < trechos.length; i++) if (Math.abs(trechos[i]! - trechos[i - 1]!) >= 3) mudancas++;

  return { duracaoSeg, picoDb: Math.round(20 * Math.log10(Math.max(pico, 1e-6)) * 10) / 10, pontosClipando, volumeLufs, variacaoDb, mudancas };
}

export function diagnosticar(m: Metricas): Diagnostico {
  const min = `${Math.floor(m.duracaoSeg / 60)}:${String(Math.round(m.duracaoSeg % 60)).padStart(2, '0')}`;
  if (m.duracaoSeg < 75) {
    return { fase: 'loop', metricas: m, motivos: [`Tem ${min}: ainda é um loop ou um trecho.`, 'Feche o loop de 8 a 16 compassos e leve para o Arrangement.'] };
  }
  if (m.duracaoSeg < 150) {
    return { fase: 'arranjo', metricas: m, motivos: [`Tem ${min}: curta para uma track de pista, que costuma ter de 4 a 7 minutos.`, 'O próximo passo é estender o arranjo com o mapa do estilo.'] };
  }
  if (m.variacaoDb < 4 || m.mudancas <= 1) {
    return {
      fase: 'arranjo',
      metricas: m,
      motivos: [`A energia quase não muda (variação de ${m.variacaoDb} dB).`, 'Parece o loop duplicado: falta subtrair elementos por seção (intro, build, break).'],
    };
  }
  if (m.mudancas < 5) {
    return {
      fase: 'vida',
      metricas: m,
      motivos: [`A estrutura existe, mas a energia vira poucas vezes (${m.mudancas} viradas).`, 'Falta tempero: fills, risers, impacts e variações entre as seções.'],
    };
  }
  if (m.pontosClipando > 0 || m.picoDb >= -0.1) {
    return {
      fase: 'mix',
      metricas: m,
      motivos: [`O áudio clipa (pico de ${m.picoDb} dBFS${m.pontosClipando ? ` em ${m.pontosClipando} pontos` : ''}).`, 'Baixe os volumes e acerte o ganho antes de pensar em master.'],
    };
  }
  if (m.volumeLufs < -16) {
    return {
      fase: 'master',
      metricas: m,
      motivos: [`Volume de cerca de ${m.volumeLufs} LUFS: baixo perto das referências.`, 'O arranjo parece completo: falta a master (pista -8 a -10, streaming -14).'],
    };
  }
  return {
    fase: 'export',
    metricas: m,
    motivos: [`Duração, energia e volume (${m.volumeLufs} LUFS) parecem de track pronta.`, 'Ouça uma última vez, exporte e conclua a track.'],
  };
}
