import type { TarefaBase } from '../tipos';

// Cada tarefa é pequena e por posição: o arranjo cru repete, esta fase faz cada trecho soar diferente.
export const VIDA: TarefaBase[] = [
  { id: 'vida.fills', fase: 'vida', tipo: 'tarefa', secao: 'Todas as seções', texto: 'Fazer uma virada de bateria no último compasso de cada frase de 8', prontoQuando: 'Toda frase termina com um fill', versaoFeia: 'Só antes dos DROPs' },
  { id: 'vida.silencio', fase: 'vida', tipo: 'tarefa', secao: 'Fim do BUILD', texto: 'Colocar 1 compasso de silêncio ou drum roll antes do DROP', prontoQuando: 'O drop chega com impacto', versaoFeia: 'Cortar o kick no último tempo' },
  { id: 'vida.riser', fase: 'vida', tipo: 'tarefa', secao: '8 compassos antes do DROP', texto: 'Colocar um riser ou sweep de noise no BUILD', prontoQuando: 'A tensão sobe até o drop', versaoFeia: 'Arrastar um riser de amostra' },
  { id: 'vida.impact', fase: 'vida', tipo: 'tarefa', secao: 'Início do DROP', texto: 'Colocar um impact ou crash no primeiro tempo do DROP', prontoQuando: 'O drop tem um "chegou"', versaoFeia: 'Só o crash' },
  { id: 'vida.downlifter', fase: 'vida', tipo: 'tarefa', secao: 'Fim do DROP', texto: 'Colocar um downlifter ou reverse crash na saída do DROP para o BREAK', prontoQuando: 'A queda soa intencional', versaoFeia: 'Reverse no clap' },
  { id: 'vida.baixo', fase: 'vida', tipo: 'tarefa', secao: 'DROP', texto: 'Variar o baixo na segunda metade do DROP (oitava, nota de passagem)', prontoQuando: 'O baixo não é igual por 32 compassos', versaoFeia: 'Uma nota diferente a cada 8 compassos' },
  { id: 'vida.ear-candy', fase: 'vida', tipo: 'tarefa', secao: 'BREAK', texto: 'Colocar ear candy no BREAK: textura, vocal em reverse, ambiência', prontoQuando: 'Tem algo para descobrir na segunda escuta', versaoFeia: 'Uma textura de chuva com LFO no volume' },
  { id: 'vida.resposta', fase: 'vida', tipo: 'tarefa', secao: 'GROOVE e DROP', texto: 'Fazer pergunta e resposta: o hook pergunta, outro elemento responde', prontoQuando: 'Os dois elementos conversam', versaoFeia: 'O hook tocar só nos compassos ímpares' },
  { id: 'vida.beat-repeat', fase: 'vida', tipo: 'tarefa', secao: 'Uma vez por seção', texto: 'Criar um dummy clip com Beat Repeat no fim de uma frase', prontoQuando: 'Soa como um gaguejo de propósito', versaoFeia: 'Só no fim do BUILD', estilos: ['house', 'garage'] },
  { id: 'vida.vocal', fase: 'vida', tipo: 'tarefa', secao: 'Onde houver vocal', texto: 'Picotar o vocal: cortar a frase e ajustar o ganho de cada pedaço', prontoQuando: 'O vocal vira instrumento', versaoFeia: 'Só picotar uma palavra' },
];
