import type { TarefaBase } from '../tipos';

export const LOOP: TarefaBase[] = [
  { id: 'loop.bateria', fase: 'loop', tipo: 'tarefa', texto: 'Montar a bateria: kick, clap, hats e percussão', prontoQuando: 'O groove toca 8 compassos sem pedir mudança', versaoFeia: 'Só kick e hat' },
  { id: 'loop.baixo', fase: 'loop', tipo: 'tarefa', texto: 'Criar o pattern principal do baixo, travado no kick', prontoQuando: 'Baixo e kick soam como um só', versaoFeia: 'Uma nota por compasso seguindo o kick' },
  { id: 'loop.kick-baixo', fase: 'loop', tipo: 'tarefa', texto: 'Acertar o timbre do kick e do baixo juntos (corte de grave, compressão leve)', prontoQuando: 'Os dois não brigam no grave', versaoFeia: 'Trocar o preset do baixo' },
  { id: 'loop.harmonia', fase: 'loop', tipo: 'tarefa', texto: 'Colocar a harmonia: acordes ou sample', prontoQuando: 'O loop tem cor (maior, menor, m7)', versaoFeia: 'Um acorde m7 segurado' },
  { id: 'loop.hook', fase: 'loop', tipo: 'tarefa', texto: 'Criar o hook, o elemento que fica na cabeça', prontoQuando: 'Dá para cantarolar o hook', versaoFeia: 'Um stab repetindo a cada 2 compassos' },
  { id: 'loop.perguntas', fase: 'loop', tipo: 'tarefa', texto: 'Responder às 4 perguntas do loop: interessante? que track? que verso? que build?', prontoQuando: 'As 4 respostas escritas', versaoFeia: 'Responder só "que build combina?"' },
  { id: 'loop.ouvir', fase: 'loop', tipo: 'tarefa', texto: 'Ouvir o loop 3 minutos seguidos', prontoQuando: 'Ainda gosto dele', versaoFeia: 'Ouvir 1 minuto' },
];
