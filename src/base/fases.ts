import type { Fase, InfoFase } from './tipos';

// As 8 fases, sempre nesta ordem. A track está terminada no fim da fase 8, com o WAV exportado.
export const FASE: Record<Fase, InfoFase> = {
  ideia: {
    id: 'ideia',
    numero: 1,
    nome: 'Ideia',
    resumo: 'Referências, BPM, tom e o projeto no lugar.',
    retomada: 'Ouvir a referência e anotar uma coisa que você quer roubar dela',
    dicas: {},
  },
  loop: {
    id: 'loop',
    numero: 2,
    nome: 'Loop',
    resumo: 'Um loop de 8 a 16 compassos que já faz dançar.',
    retomada: 'Abrir o projeto, ouvir o loop 1 minuto e trocar um som',
    dicas: {
      deep: 'Acorde base m7 11/9, deep bass em sine com release curto, shaker com ghost notes.',
      house: '909 com swing 16, piano de Korg M1 ou Rhodes, organ bass.',
      garage: 'Kick em 2-step, shuffle forte nos hats, electric piano com acordes menores e diminutos.',
    },
  },
  arranjo: {
    id: 'arranjo',
    numero: 3,
    nome: 'Arranjo',
    resumo: 'Sair do loop: a track inteira e depois subtrair por seção.',
    retomada: 'Tocar a partir do último locator mexido e apagar um elemento de uma seção',
    dicas: {
      house: 'Mudanças a cada 8 compassos; uma camada entra enquanto outra sai; guarde a mais forte para o fim.',
      deep: 'Mudanças a cada 8 compassos; uma camada entra enquanto outra sai; guarde a mais forte para o fim.',
      garage: 'Mudanças a cada 8 compassos; uma camada entra enquanto outra sai; guarde a mais forte para o fim.',
    },
  },
  vida: {
    id: 'vida',
    numero: 4,
    nome: 'Vida',
    resumo: 'Fills, ear candy e transições: cada 16 compassos soa diferente.',
    retomada: 'Fazer uma virada antes de um DROP, só uma',
    dicas: {
      garage: 'Vocal R&B picotado é o protagonista; variações de shuffle nos hats valem mais que FX.',
      deep: 'Menos FX e mais movimento lento: a vida vem de texturas e de filtros.',
      house: 'Stabs de piano e fills de 909 carregam a energia; risers mais curtos.',
    },
  },
  automacao: {
    id: 'automacao',
    numero: 5,
    nome: 'Automação',
    resumo: 'Movimento: cada tarefa é um envelope, num parâmetro, numa seção.',
    retomada: 'Desenhar uma curva de 4 pontos num filtro, sem ouvir o resto',
    dicas: {
      deep: 'Sweeps longos e lentos (16 a 32 compassos) no low-pass da harmonia; LFO lento no cutoff do baixo; pouco FX.',
      house: 'Filtro de piano no BUILD, delay nas últimas palavras do vocal, high-pass rápido de 4 compassos antes do DROP.',
      garage: 'Automação curta e rítmica: delay em 1/8 pontuado no vocal, gate picotando o baixo, filtro abrindo só nos 2 compassos antes do DROP.',
    },
  },
  mix: {
    id: 'mix',
    numero: 6,
    nome: 'Mix básica',
    resumo: 'Soa bem em fone, caixa e celular. Não é mix de estúdio.',
    retomada: 'Ouvir o drop no celular e anotar o que mais incomoda',
    dicas: {},
  },
  master: {
    id: 'master',
    numero: 7,
    nome: 'Master básica',
    resumo: 'Cadeia simples e volume no alvo do destino.',
    retomada: 'Comparar 30 segundos com a referência',
    dicas: {},
  },
  export: {
    id: 'export',
    numero: 8,
    nome: 'Export',
    resumo: 'O WAV existe: a track está terminada.',
    retomada: 'Exportar como está e ouvir no caminho de casa',
    dicas: {},
  },
};
