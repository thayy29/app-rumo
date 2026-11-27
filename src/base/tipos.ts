// Tipos da base de conhecimento (ADR-016). A base é dado tipado, sem IA e sem rede:
// cada fase tem tarefas que cabem num bloco de 25 minutos, com "pronto quando" e "versão feia".

export const ESTILOS = ['house', 'deep', 'garage'] as const;
export type Estilo = (typeof ESTILOS)[number];

export const FASES = ['ideia', 'loop', 'arranjo', 'vida', 'automacao', 'mix', 'master', 'export'] as const;
export type Fase = (typeof FASES)[number];

export const SECOES = ['INTRO', 'GROOVE', 'BUILD', 'DROP 1', 'BREAK', 'BUILD 2', 'DROP 2', 'OUTRO'] as const;
export type Secao = (typeof SECOES)[number];

// tarefa: entra na trilha e precisa ser feita.
// cardapio: opção de automação; a pessoa escolhe de 3 a 6 por track (FR-026).
export type TipoTarefa = 'tarefa' | 'cardapio';

export type TarefaBase = {
  id: string; // estável: liga a tarefa da track à base (tarefa.base_id)
  fase: Fase;
  texto: string; // começa com verbo e alvo concreto
  prontoQuando: string; // dá para checar ouvindo
  versaoFeia: string; // 10 minutos, para dia difícil e retomada
  tipo: TipoTarefa;
  grupo?: string; // subdivisão da fase, ex.: "Esqueleto" no arranjo
  secao?: string; // onde, na track
  parametro?: string; // só no cardápio de automação
  estilos?: readonly Estilo[]; // ausente: vale para todos
};

export type InfoFase = {
  id: Fase;
  numero: number;
  nome: string;
  apelido: string; // nome de jogo da etapa (gamificação)
  resumo: string;
  explicacao: string; // o que é a etapa e como saber que você está nela
  retomada: string; // passo de volta de 10 minutos
  dicas: Partial<Record<Estilo, string>>;
};

export type InfoSecao = {
  id: Secao;
  papel: string; // para que serve a seção
  comoReconhecer: string; // como saber que você está nela
};

export type InfoEstilo = {
  id: Estilo;
  nome: string;
  bpm: { min: number; max: number; padrao: number };
  groove: string;
  timbres: string;
  mix: string;
  mapa: Record<Secao, number>; // compassos de cada seção
};
