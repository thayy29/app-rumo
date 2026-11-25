import { extrairDaPagina } from '../pagina';

// Réplicas simplificadas dos formatos mais comuns de página de curso.

const ACORDEAO = String.raw`<html><body>
<header><nav><ul><li>Cursos</li><li>Planos</li><li>Entrar</li></ul></nav></header>
<main>
  <h1>Curso de React: componentes e hooks</h1>
  <p>Aprenda React do zero com projetos práticos. Este curso é para quem já sabe JavaScript.</p>
  <h2>Conteúdo do curso</h2>
  <details><summary>1. Primeiros passos <span>4 aulas · 32 min</span></summary>
    <ul><li><a href="#">Apresentação</a> <span>02:10</span></li><li>Criando o projeto com Vite</li><li>JSX na prática</li><li>Ver mais</li></ul></details>
  <details><summary>2. Estado e eventos</summary>
    <ul><li>useState</li><li>Eventos de formulário</li></ul></details>
  <details><summary>3. Efeitos</summary>
    <ul><li>useEffect sem sustos</li><li>Buscando dados de uma API</li></ul></details>
  <h2>Perguntas frequentes</h2>
  <details><summary>Tem certificado?</summary><ul><li>Sim, ao concluir.</li></ul></details>
  <details><summary>Posso parcelar?</summary><ul><li>Em até 12x.</li></ul></details>
</main>
<footer><ul><li>Termos</li><li>Privacidade</li></ul></footer>
</body></html>`;

const SECOES = String.raw`<html><body><main>
  <h1>Python para análise de dados</h1>
  <h2>Sobre o curso</h2><p>Um curso completo.</p>
  <h2>Semana 1 · Fundamentos</h2><ol><li>Variáveis e tipos</li><li>Listas e dicionários</li></ol>
  <h2>Semana 2 · Pandas</h2><ol><li>DataFrames</li><li>Limpeza de dados</li><li>Agrupamentos</li></ol>
  <h2>Avaliações</h2><ul><li>Nota 4,8</li></ul>
</main></body></html>`;

const JSON_LD = String.raw`<html><head>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Course","name":"SQL do básico ao avançado",
"syllabusSections":[{"@type":"Syllabus","name":"Consultas com SELECT"},{"@type":"Syllabus","name":"JOINs"},{"@type":"Syllabus","name":"Índices e desempenho"}]}</script>
</head><body><div id="app"></div><script>window.boot()</script></body></html>`;

const SO_JAVASCRIPT = String.raw`<html><body><div id="root"></div><script src="/app.js"></script></body></html>`;

describe('extrairDaPagina', () => {
  it('página com acordeões: seções viram módulos, aulas viram tópicos', () => {
    const r = extrairDaPagina(ACORDEAO);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.sumario.grupos.map((g) => g.nome)).toEqual(['Primeiros passos', 'Estado e eventos', 'Efeitos']);
    expect(r.sumario.grupos[0]?.topicos.map((t) => t.texto)).toEqual(['Apresentação', 'Criando o projeto com Vite', 'JSX na prática']);
    expect(r.sumario.totalTopicos).toBe(7);
  });

  it('ignora menu, rodapé, "ver mais" e perguntas frequentes', () => {
    const r = extrairDaPagina(ACORDEAO);
    if (!r.ok) throw new Error('esperava ok');
    const tudo = JSON.stringify(r.sumario);
    for (const ruido of ['Entrar', 'Termos', 'Ver mais', 'certificado', 'parcelar']) expect(tudo).not.toContain(ruido);
  });

  it('página com seções em títulos e listas numeradas', () => {
    const r = extrairDaPagina(SECOES);
    if (!r.ok) throw new Error('esperava ok');
    expect(r.sumario.grupos.map((g) => g.nome)).toEqual(['Semana 1 · Fundamentos', 'Semana 2 · Pandas']);
    expect(r.sumario.totalTopicos).toBe(5);
  });

  it('usa os dados estruturados quando a página é montada por JavaScript', () => {
    const r = extrairDaPagina(JSON_LD);
    if (!r.ok) throw new Error('esperava ok');
    expect(r.sumario.grupos[0]?.nome).toBe('SQL do básico ao avançado');
    expect(r.sumario.totalTopicos).toBe(3);
  });

  it('sem nada para ler, pede a lista colada', () => {
    expect(extrairDaPagina(SO_JAVASCRIPT)).toEqual({ ok: false, erro: 'SEM_SUMARIO' });
  });
});
