import type { TarefaBase } from '../tipos';

export const IDEIA: TarefaBase[] = [
  { id: 'ideia.destino', fase: 'ideia', tipo: 'tarefa', texto: 'Decidir se a track é para pista ou streaming', prontoQuando: 'Escrevi uma das duas', versaoFeia: 'Escolher pista e seguir' },
  { id: 'ideia.referencias', fase: 'ideia', tipo: 'tarefa', texto: 'Separar 2 ou 3 tracks de referência numa pasta do projeto', prontoQuando: 'As referências tocam no Ableton', versaoFeia: 'Arrastar uma referência só' },
  { id: 'ideia.bpm-tom', fase: 'ideia', tipo: 'tarefa', texto: 'Anotar BPM e tom de partida', prontoQuando: 'BPM e tom no nome do projeto', versaoFeia: 'Usar o BPM do estilo e Lá menor' },
  { id: 'ideia.projeto', fase: 'ideia', tipo: 'tarefa', texto: 'Criar o projeto numa pasta só dele, com nome claro', prontoQuando: 'O projeto está salvo na pasta certa', versaoFeia: 'Salvar com o nome da ideia' },
];
