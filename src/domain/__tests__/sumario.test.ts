import { importarSumario, limparLinha, marcarAte, porcentagem, resumo } from '../sumario';

describe('limparLinha', () => {
  it.each([
    ['1. O que é computação em nuvem', 'O que é computação em nuvem'],
    ['1.2 - Regiões e zonas', 'Regiões e zonas'],
    ['3) IAM: políticas', 'IAM: políticas'],
    ['• Criptografia e KMS', 'Criptografia e KMS'],
    ['- Shield, WAF e Inspector', 'Shield, WAF e Inspector'],
    ['Introdução ao React 05:12', 'Introdução ao React'],
    ['Hooks avançados (1:02:30)', 'Hooks avançados'],
    ['Exercício prático · 12 min', 'Exercício prático'],
    ['   ', ''],
  ])('%s → %s', (entrada, esperado) => {
    expect(limparLinha(entrada)).toBe(esperado);
  });

  it('não remove o número de uma linha de módulo', () => {
    expect(limparLinha('Módulo 1 · Conceitos de nuvem')).toBe('Módulo 1 · Conceitos de nuvem');
  });
});

describe('importarSumario', () => {
  const certificacao = `
Módulo 1 · Conceitos de nuvem
1. O que é computação em nuvem
2. Regiões e zonas de disponibilidade
3. Modelos de implantação

Módulo 2 · Segurança
1. Responsabilidade compartilhada
2. Contas e conta root
3. IAM: usuários e grupos
4. IAM: políticas
`;

  it('agrupa por módulo e conta tópicos', () => {
    const s = importarSumario(certificacao, 'AWS');
    expect(s.grupos.map((g) => g.nome)).toEqual([
      'Módulo 1 · Conceitos de nuvem',
      'Módulo 2 · Segurança',
    ]);
    expect(s.totalTopicos).toBe(7);
    expect(resumo(s)).toBe('7 tópicos em 2 módulos');
  });

  it('sem linhas de módulo, usa o nome do estudo como grupo único', () => {
    const s = importarSumario('Aula 1: Introdução\nAula 2: Variáveis\n', 'Curso de JS');
    expect(s.grupos).toEqual([
      {
        nome: 'Curso de JS',
        topicos: [
          { texto: 'Aula 1: Introdução', detalhes: [] },
          { texto: 'Aula 2: Variáveis', detalhes: [] },
        ],
      },
    ]);
  });

  it('reconhece Seção, Capítulo, Unidade e Domínio', () => {
    const s = importarSumario('Seção 1\na\nCapítulo 2\nb\nUnidade 3\nc\nDomínio 4\nd', 'x');
    expect(s.grupos).toHaveLength(4);
  });

  it('ignora reticências e descarta grupos vazios', () => {
    const s = importarSumario('Módulo 1\n…\nMódulo 2\nTópico', 'x');
    expect(s.grupos).toEqual([{ nome: 'Módulo 2', topicos: [{ texto: 'Tópico', detalhes: [] }] }]);
    expect(s.linhasIgnoradas).toBe(1);
  });

  it('corta em 300 linhas e avisa', () => {
    const texto = Array.from({ length: 350 }, (_, i) => `Tópico ${i + 1}`).join('\n');
    const s = importarSumario(texto, 'x');
    expect(s.truncado).toBe(true);
    expect(s.totalTopicos).toBe(300);
  });
});

describe('colar a página inteira de um guia (o caso do print)', () => {
  const pagina = `Guia de estudo para o Exame AI-103
Finalidade deste documento
Este guia de estudo deve ajudar você a entender o que esperar do exame e inclui um resumo dos tópicos.
Observação
Os marcadores que seguem cada uma das habilidades medidas destinam-se a ilustrar como estamos avaliando essa habilidade. Tópicos relacionados podem ser abordados no exame.
Observação
A maioria das perguntas aborda recursos que estão em disponibilidade geral.
Habilidades medidas a partir de 16 de abril de 2026
Planejar e gerenciar uma solução de IA do Azure (25–30%)
Escolher os serviços adequados do Foundry
Escolher um modelo apropriado para cada tarefa, incluindo modelos de linguagem grandes, modelos pequenos, modelos multimodais e ferramentas do Foundry
Configurar soluções de IA no Foundry
Implementar soluções de IA generativa e agênticas (30–35%)
Criar agentes
Recursos de estudo
Caminho de aprendizado`;

  const s = importarSumario(pagina, 'AI-103');

  it('lê só a seção de habilidades e usa o peso na prova como módulo', () => {
    expect(s.grupos.map((g) => g.nome)).toEqual([
      'Planejar e gerenciar uma solução de IA do Azure (25–30%)',
      'Implementar soluções de IA generativa e agênticas (30–35%)',
    ]);
  });

  it('descarta parágrafos e avisos; mantém os subtemas', () => {
    expect(s.grupos.flatMap((g) => g.topicos.map((t) => t.texto))).toEqual([
      'Escolher os serviços adequados do Foundry',
      'Configurar soluções de IA no Foundry',
      'Criar agentes',
    ]);
  });
});

describe('texto corrido em sumário comum', () => {
  it('ignora "Observação" e parágrafos, conta como ignorados', () => {
    const s = importarSumario('Observação\nEste curso tem 10 horas de vídeo e exercícios práticos para você praticar.\nAula 1\nAula 2', 'x');
    expect(s.totalTopicos).toBe(2);
    expect(s.linhasIgnoradas).toBe(2);
  });
});

describe('marcarAte e porcentagem', () => {
  it('marca o tópico tocado e todos os anteriores', () => {
    expect(marcarAte(['a', 'b', 'c', 'd'], 2)).toEqual(['a', 'b', 'c']);
    expect(marcarAte(['a'], -1)).toEqual([]);
  });

  it('arredonda para baixo e trata total zero', () => {
    expect(porcentagem(9, 24)).toBe(37);
    expect(porcentagem(0, 0)).toBe(0);
  });
});
