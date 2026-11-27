import type { TarefaBase } from '../tipos';

export const MASTER: TarefaBase[] = [
  { id: 'master.cadeia', fase: 'master', tipo: 'tarefa', texto: 'Montar a cadeia: saturação leve, EQ suave, Glue (até 4 dB) e Limiter', prontoQuando: 'A cadeia está no master na ordem', versaoFeia: 'Só o Limiter' },
  { id: 'master.referencia', fase: 'master', tipo: 'tarefa', texto: 'Comparar com a referência em volume parecido', prontoQuando: 'Graves e brilho perto da referência', versaoFeia: 'Comparar só o drop' },
  { id: 'master.loudness', fase: 'master', tipo: 'tarefa', texto: 'Ajustar o Limiter ao destino: pista -8 a -10 LUFS; streaming -14 LUFS', prontoQuando: 'O medidor mostra o alvo', versaoFeia: 'Ceiling em -1 dB e ganho até soar alto sem distorcer' },
];
