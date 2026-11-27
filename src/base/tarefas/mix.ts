import type { TarefaBase } from '../tipos';

export const MIX: TarefaBase[] = [
  { id: 'mix.ganho', fase: 'mix', tipo: 'tarefa', texto: 'Baixar tudo para ~-12 dB, faders no zero, ganho no clip', prontoQuando: 'Nada clipa; pico da mix entre -6 e -10 dB', versaoFeia: 'Baixar o master para não clipar' },
  { id: 'mix.volumes', fase: 'mix', tipo: 'tarefa', texto: 'Ajustar volumes a partir do kick (baixo -3 a -6 dB, hats -6 a -7 dB)', prontoQuando: 'Kick e baixo claros; nada some', versaoFeia: 'Só kick, baixo e hook' },
  { id: 'mix.highpass', fase: 'mix', tipo: 'tarefa', texto: 'Colocar high-pass em tudo que não é kick e baixo', prontoQuando: 'O grave fica só com kick e baixo', versaoFeia: 'High-pass nos pads e hats' },
  { id: 'mix.sidechain', fase: 'mix', tipo: 'tarefa', texto: 'Fazer o sidechain do baixo no kick (~6 dB, release no tempo do BPM)', prontoQuando: 'O kick aparece sem subir volume', versaoFeia: 'Sidechain com o preset do Compressor' },
  { id: 'mix.espaco', fase: 'mix', tipo: 'tarefa', texto: 'Abrir espaço: kick e baixo em mono no centro; leads e pads para os lados', prontoQuando: 'A mix tem largura sem perder o centro', versaoFeia: 'Só abrir os pads' },
  { id: 'mix.ouvir', fase: 'mix', tipo: 'tarefa', texto: 'Ouvir em fone, caixa e celular', prontoQuando: 'Nada estranho em nenhum dos três', versaoFeia: 'Só no celular' },
];
