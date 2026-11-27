import type { TarefaBase } from '../tipos';

// Lançamento e divulgação ficam fora: a track está terminada quando o WAV existe.
export const EXPORT: TarefaBase[] = [
  { id: 'export.wav', fase: 'export', tipo: 'tarefa', texto: 'Exportar WAV 44,1 kHz, 24 bits, com dither', prontoQuando: 'O arquivo existe na pasta do projeto', versaoFeia: 'Exportar com o padrão do Ableton' },
  { id: 'export.ouvir', fase: 'export', tipo: 'tarefa', texto: 'Ouvir o arquivo exportado inteiro', prontoQuando: 'Sem cortes nem estalos', versaoFeia: 'Ouvir início, drop e fim' },
  { id: 'export.nome', fase: 'export', tipo: 'tarefa', texto: 'Dar o nome definitivo e guardar', prontoQuando: '"Artista – Nome (Original Mix).wav" salvo', versaoFeia: 'Guardar com o nome do projeto' },
];
