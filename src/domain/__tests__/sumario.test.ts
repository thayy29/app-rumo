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
    expect(s.grupos).toEqual([{ nome: 'Curso de JS', topicos: ['Aula 1: Introdução', 'Aula 2: Variáveis'] }]);
  });

  it('reconhece Seção, Capítulo, Unidade e Domínio', () => {
    const s = importarSumario('Seção 1\na\nCapítulo 2\nb\nUnidade 3\nc\nDomínio 4\nd', 'x');
    expect(s.grupos).toHaveLength(4);
  });

  it('ignora reticências e descarta grupos vazios', () => {
    const s = importarSumario('Módulo 1\n…\nMódulo 2\nTópico', 'x');
    expect(s.grupos).toEqual([{ nome: 'Módulo 2', topicos: ['Tópico'] }]);
    expect(s.linhasIgnoradas).toBe(1);
  });

  it('corta em 300 linhas e avisa', () => {
    const texto = Array.from({ length: 350 }, (_, i) => `Tópico ${i + 1}`).join('\n');
    const s = importarSumario(texto, 'x');
    expect(s.truncado).toBe(true);
    expect(s.totalTopicos).toBe(300);
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
