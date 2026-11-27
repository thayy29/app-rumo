import type { Fase, InfoFase } from './tipos';

// As 8 fases, sempre nesta ordem. A track está terminada no fim da fase 8, com o WAV exportado.
export const FASE: Record<Fase, InfoFase> = {
  ideia: {
    id: 'ideia',
    numero: 1,
    nome: 'Ideia',
    apelido: 'Faísca',
    resumo: 'Referências, BPM, tom e o projeto no lugar.',
    explicacao:
      'Antes de qualquer som: decidir para onde a track vai, separar referências e deixar o projeto no lugar. Você está aqui se ainda não abriu o Ableton para essa música.',
    retomada: 'Ouvir a referência e anotar uma coisa que você quer roubar dela',
    dicas: {},
  },
  loop: {
    id: 'loop',
    numero: 2,
    nome: 'Loop',
    apelido: 'Groove',
    resumo: 'Um loop de 8 a 16 compassos que já faz dançar.',
    explicacao:
      'Um trecho de 8 a 16 compassos com bateria, baixo, harmonia e um hook. Você está aqui se a música toca em loop na Session e ainda não tem começo, meio e fim.',
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
    apelido: 'Esqueleto',
    resumo: 'Sair do loop: a track inteira e depois subtrair por seção.',
    explicacao:
      'O loop vira uma track inteira de 4 a 7 minutos, por subtração: cada seção perde elementos. Você está aqui se tem o loop pronto mas ele ainda não virou intro, build, drop e break.',
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
    apelido: 'Tempero',
    resumo: 'Fills, ear candy e transições: cada 16 compassos soa diferente.',
    explicacao:
      'Viradas, risers, impacts, ear candy e variações para cada 16 compassos soarem diferentes. Você está aqui se a estrutura existe mas a track soa repetitiva.',
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
    apelido: 'Movimento',
    resumo: 'Movimento: cada tarefa é um envelope, num parâmetro, numa seção.',
    explicacao:
      'Envelopes de filtro, volume e sends que dão respiração à track. Você está aqui se as partes estão certas mas tudo soa estático.',
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
    apelido: 'Equilíbrio',
    resumo: 'Soa bem em fone, caixa e celular. Não é mix de estúdio.',
    explicacao:
      'Volumes, high-pass, sidechain e espaço estéreo para tudo se ouvir. Você está aqui se a música está completa mas algo some, embola ou clipa.',
    retomada: 'Ouvir o drop no celular e anotar o que mais incomoda',
    dicas: {},
  },
  master: {
    id: 'master',
    numero: 7,
    nome: 'Master básica',
    apelido: 'Brilho',
    resumo: 'Cadeia simples e volume no alvo do destino.',
    explicacao:
      'Cadeia simples no master e volume no alvo da pista ou do streaming. Você está aqui se a mix está boa mas soa baixa perto das referências.',
    retomada: 'Comparar 30 segundos com a referência',
    dicas: {},
  },
  export: {
    id: 'export',
    numero: 8,
    nome: 'Export',
    apelido: 'Lançamento',
    resumo: 'O WAV existe: a track está terminada.',
    explicacao:
      'Exportar o WAV, ouvir e dar o nome final. Você está aqui se a track soa pronta e só falta o arquivo.',
    retomada: 'Exportar como está e ouvir no caminho de casa',
    dicas: {},
  },
};
