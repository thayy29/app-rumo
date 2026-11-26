import { analisarEntrada } from '../entrada';
import { importarSumario } from '../sumario';

describe('analisarEntrada', () => {
  it('vazio', () => {
    expect(analisarEntrada('   \n ')).toEqual({ tipo: 'vazia' });
  });

  it('link sozinho, de qualquer site', () => {
    expect(analisarEntrada('https://www.alura.com.br/curso-online-react')).toEqual({
      tipo: 'link',
      url: 'https://www.alura.com.br/curso-online-react',
      site: 'alura.com.br',
    });
  });

  it('link sem https e com espaços em volta', () => {
    const e = analisarEntrada('  www.coursera.org/learn/python  ');
    expect(e).toMatchObject({ tipo: 'link', url: 'https://www.coursera.org/learn/python', site: 'coursera.org' });
  });

  it('link que veio junto com o título da página (compartilhar do Safari)', () => {
    const e = analisarEntrada('Exame AI-103 | Microsoft Learn\nhttps://learn.microsoft.com/pt-br/credentials/certifications/exams/ai-103/');
    expect(e).toMatchObject({ tipo: 'link', site: 'learn.microsoft.com' });
  });

  it('lista de aulas com um link no meio é texto', () => {
    const e = analisarEntrada('Módulo 1\nAula 1 - Introdução\nhttps://exemplo.com/material\nAula 2 - Props');
    expect(e).toEqual({ tipo: 'texto' });
  });

  it('o caso do teste: link no modo texto não vira tópico', () => {
    const s = importarSumario('Módulo 1\nAula 1 - Introdução\nhttps://exemplo.com/material\nAula 2 - Props', 'Curso');
    expect(s.totalTopicos).toBe(2);
    expect(s.linhasIgnoradas).toBe(1);
  });

  it('uma linha comum é texto', () => {
    expect(analisarEntrada('Introdução ao React')).toEqual({ tipo: 'texto' });
  });
});
