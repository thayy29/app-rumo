import { extrairGuiaMicrosoft, normalizarLinkGuia, textoDoHtml } from '../guiaMicrosoft';
import { resumo } from '../sumario';

// Réplica da estrutura do guia de estudo do Microsoft Learn (versão em português),
// com o ruído que aparece na página real: introdução, avisos, "visão rápida" e recursos.
const GUIA = `
<html><head><style>.x{}</style><script>var a = "<h3>não</h3>";</script></head><body>
<nav><ul><li>Início</li><li>Credenciais</li></ul></nav>
<h1>Guia de estudo para o Exame AI-103</h1>
<h2 id="purpose">Finalidade deste documento</h2>
<p>Este guia de estudo deve ajudar você a entender o que esperar do exame.</p>
<div class="alert"><p>Observação</p><p>Os marcadores que seguem cada uma das habilidades medidas destinam-se a ilustrar como estamos avaliando essa habilidade.</p></div>
<h2 id="skills-at-a-glance">Visão geral das habilidades</h2>
<ul><li>Planejar e gerenciar uma solução de IA do Azure (25–30%)</li><li>Implementar soluções de IA generativa e agênticas (30–35%)</li></ul>
<h2 id="skills-measured">Habilidades medidas a partir de 16 de abril de 2026</h2>
<h3 id="area-1">Planejar e gerenciar uma solução de IA do Azure (25&ndash;30%)</h3>
<h4>Escolher os serviços adequados do Foundry</h4>
<ul>
  <li><p>Escolher um modelo apropriado para cada tarefa, incluindo <strong>LLMs</strong></p></li>
  <li>Escolher entre agentes e fluxos de trabalho</li>
</ul>
<h4>Configurar soluções de IA no Foundry</h4>
<ul><li>Criar e configurar um projeto do Foundry</li></ul>
<h3>Implementar soluções de IA generativa e agênticas (30–35%)</h3>
<h4>Criar agentes</h4>
<ul><li>Implementar chamadas de ferramentas</li></ul>
<h2 id="study-resources">Recursos de estudo</h2>
<h3>Treinamento</h3><ul><li>Caminho de aprendizado</li></ul>
<footer><ul><li>Privacidade</li></ul></footer>
</body></html>`;

describe('extrairGuiaMicrosoft', () => {
  const r = extrairGuiaMicrosoft(GUIA);
  if (!r.ok) throw new Error('esperava sucesso');
  const { sumario } = r;

  it('usa as áreas como módulos e os subtemas como tópicos', () => {
    expect(sumario.grupos.map((g) => g.nome)).toEqual([
      'Planejar e gerenciar uma solução de IA do Azure (25–30%)',
      'Implementar soluções de IA generativa e agênticas (30–35%)',
    ]);
    expect(sumario.grupos[0]?.topicos.map((t) => t.texto)).toEqual([
      'Escolher os serviços adequados do Foundry',
      'Configurar soluções de IA no Foundry',
    ]);
    expect(resumo(sumario)).toBe('3 tópicos em 2 módulos');
  });

  it('guarda os objetivos como "o que estudar" do subtema, sem tags', () => {
    expect(sumario.grupos[0]?.topicos[0]?.detalhes).toEqual([
      'Escolher um modelo apropriado para cada tarefa, incluindo LLMs',
      'Escolher entre agentes e fluxos de trabalho',
    ]);
  });

  it('ignora introdução, avisos, visão rápida, recursos de estudo, menu e rodapé', () => {
    const tudo = JSON.stringify(sumario);
    for (const ruido of ['Observação', 'Finalidade', 'Recursos', 'Treinamento', 'Privacidade', 'Início', 'não']) {
      expect(tudo).not.toContain(ruido);
    }
  });

  it('em guia sem subtemas, cada objetivo vira um tópico', () => {
    const html = '<h2>Skills measured</h2><h3>Describe cloud concepts (25–30%)</h3><ul><li>Define cloud computing</li><li>Describe the shared responsibility model</li></ul>';
    const s = extrairGuiaMicrosoft(html);
    expect(s.ok && s.sumario.grupos[0]?.topicos.map((t) => t.texto)).toEqual(['Define cloud computing', 'Describe the shared responsibility model']);
  });

  it('sem seção de habilidades, avisa', () => {
    expect(extrairGuiaMicrosoft('<h1>Página</h1><p>texto</p>')).toEqual({ ok: false, erro: 'SEM_HABILIDADES' });
  });
});

describe('normalizarLinkGuia', () => {
  it('aceita o link do guia como está', () => {
    expect(normalizarLinkGuia('https://learn.microsoft.com/pt-br/credentials/certifications/resources/study-guides/ai-103')).toEqual({
      ok: true,
      url: 'https://learn.microsoft.com/pt-br/credentials/certifications/resources/study-guides/ai-103',
    });
  });

  it('troca o link da página do exame pelo do guia', () => {
    expect(normalizarLinkGuia('https://learn.microsoft.com/credentials/certifications/exams/ai-103/')).toEqual({
      ok: true,
      url: 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/ai-103',
    });
  });

  it('recusa outros sites e textos que não são link', () => {
    expect(normalizarLinkGuia('https://www.udemy.com/course/x')).toEqual({ ok: false, erro: 'NAO_E_MICROSOFT_LEARN' });
    expect(normalizarLinkGuia('ai-103')).toEqual({ ok: false, erro: 'LINK_INVALIDO' });
    expect(normalizarLinkGuia('https://learn.microsoft.com.evil.com/x')).toEqual({ ok: false, erro: 'NAO_E_MICROSOFT_LEARN' });
  });
});

describe('textoDoHtml', () => {
  it('remove tags e decodifica entidades', () => {
    expect(textoDoHtml('<p>IA &amp; agentes&nbsp;(25&#8211;30%)</p>')).toBe('IA & agentes (25–30%)');
  });
});
