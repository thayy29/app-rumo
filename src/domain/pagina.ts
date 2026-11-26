// Lê a página de um curso de qualquer site e monta módulos e tópicos, sem IA e sem servidor.
// Ordem de tentativa:
//   1. dados estruturados da página (JSON-LD do tipo Course, que muitos sites publicam para o Google);
//   2. a estrutura do HTML: títulos que se repetem viram módulos; o que vem embaixo deles vira tópico.
// Páginas que só mostram as aulas depois do login ou que montam a lista com JavaScript não têm o que ler:
// aí a pessoa recebe o pedido de colar a lista de aulas.

import { textoDoHtml } from './guiaMicrosoft';
import { ehTextoCorrido, fecharSumario, limparLinha, LIMITE_LINHAS, type GrupoImportado, type SumarioImportado } from './sumario';

export type ResultadoPagina = { ok: true; sumario: SumarioImportado } | { ok: false; erro: 'SEM_SUMARIO' };

const MINIMO_TOPICOS = 3;
const RUIDO_HTML = /<(script|style|noscript|svg|nav|header|footer|aside|form|button|template|select)\b[\s\S]*?<\/\1>/gi;

// Seções de página que nunca são conteúdo do curso.
const SECAO_DE_RUIDO =
  /^(compartilh|share|menu|entrar|login|cadastr|assine|comprar|buy|matr[íi]cul|enroll|veja tamb[ée]m|see also|relacionad|related|recomendad|recommended|coment[áa]rio|comments|avalia[çc]|reviews?\b|depoimento|testimonial|faq|perguntas frequentes|frequently asked|instrutor|instructor|professor|sobre (o|a|n)|about (the|us)|termos|terms|privacidade|privacy|cookies|newsletter|contato|contact|pre[çc]o|pricing|planos|certificado de conclus|requisitos|requirements|navega|breadcrumb|índice|table of contents|in this article|neste artigo|feedback|anterior|próximo|next|previous)/i;

const TOPICO_DE_RUIDO = /^(ver mais|ver todos|see more|show more|mostrar mais|expandir|expand|recolher|collapse|saiba mais|learn more|leia mais|read more|clique|click|voltar|back|início|home|\d+\s*(aulas?|lessons?|lectures?|v[íi]deos?|min|h)\b.*)$/i;

// Contagens que os sites colam no título da seção: "4 aulas · 32 min", "12 lectures", "3 itens".
const CONTAGEM_FINAL = /\s*[·•|(-]?\s*\d+\s*(aulas?|lessons?|lectures?|v[íi]deos?|itens|items|atividades|activities|cap[íi]tulos)\b.*$/i;

type No = { nivel: number; texto: string };
const NIVEL: Record<string, number> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, summary: 3, dt: 4, li: 9 };

function conteudoPrincipal(html: string): string {
  const main = html.match(/<main\b[\s\S]*<\/main>/i);
  if (main) return main[0];
  const article = html.match(/<article\b[\s\S]*<\/article>/i);
  return article ? article[0] : html;
}

function nos(html: string): No[] {
  const limpo = conteudoPrincipal(html).replace(RUIDO_HTML, ' ');
  // Um <li> que contém outra lista conta só pelo próprio texto, antes da sublista.
  const re = /<(h[1-5]|summary|dt|li)\b[^>]*>([\s\S]*?)(?=<\/\1>|<(?:ul|ol|li)\b)/gi;
  const lista: No[] = [];
  for (let m = re.exec(limpo); m; m = re.exec(limpo)) {
    const texto = limparLinha(textoDoHtml(m[2] ?? ''));
    if (texto) lista.push({ nivel: NIVEL[(m[1] ?? '').toLowerCase()] ?? 9, texto });
  }
  return lista;
}

function topicoValido(t: string): boolean {
  return t.length >= 2 && !ehTextoCorrido(t) && !TOPICO_DE_RUIDO.test(t);
}

// Escolhe o nível de título que funciona como "módulo": o que mais se repete com conteúdo embaixo.
function nivelDosModulos(lista: No[]): number | null {
  let melhor: { nivel: number; nota: number } | null = null;
  for (const nivel of [2, 3, 4]) {
    let nota = 0;
    lista.forEach((no, i) => {
      if (no.nivel !== nivel || SECAO_DE_RUIDO.test(no.texto)) return;
      const proximo = lista[i + 1];
      if (proximo && proximo.nivel > nivel && topicoValido(proximo.texto)) nota++;
    });
    if (nota >= 2 && (!melhor || nota > melhor.nota)) melhor = { nivel, nota };
  }
  return melhor?.nivel ?? null;
}

export function extrairDaEstrutura(html: string, nomePadrao = 'Conteúdo'): ResultadoPagina {
  const lista = nos(html);
  const nivel = nivelDosModulos(lista);
  const grupos: GrupoImportado[] = [];

  if (nivel === null) {
    const soltos = lista.filter((n) => n.nivel === 9 && topicoValido(n.texto));
    grupos.push({ nome: nomePadrao, topicos: soltos.map((n) => ({ texto: n.texto, detalhes: [] })) });
  } else {
    let grupo: GrupoImportado | null = null;
    let nivelDoTopico: number | null = null;
    let secaoDeRuido: number | null = null; // nível de um título acima dos módulos que é ruído (ex.: "Perguntas frequentes")
    for (const no of lista) {
      if (no.nivel <= nivel) {
        const ruido = SECAO_DE_RUIDO.test(no.texto);
        if (secaoDeRuido !== null && no.nivel <= secaoDeRuido) secaoDeRuido = null;
        if (no.nivel < nivel && ruido) secaoDeRuido = no.nivel;
        const nome = no.texto.replace(CONTAGEM_FINAL, '').trim();
        grupo = no.nivel === nivel && !ruido && secaoDeRuido === null && nome ? { nome, topicos: [] } : null;
        if (grupo) grupos.push(grupo);
        nivelDoTopico = null;
        continue;
      }
      if (!grupo || !topicoValido(no.texto)) continue;
      // O primeiro nível abaixo do módulo define o tópico; o que vier mais fundo vira "o que estudar".
      nivelDoTopico ??= no.nivel;
      if (no.nivel <= nivelDoTopico) grupo.topicos.push({ texto: no.texto, detalhes: [] });
      else grupo.topicos[grupo.topicos.length - 1]?.detalhes.push(no.texto);
    }
  }

  return fechar(grupos);
}

// ---- JSON-LD (schema.org/Course) ----

type Objeto = Record<string, unknown>;

function blocosJsonLd(html: string): unknown[] {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const saida: unknown[] = [];
  for (let m = re.exec(html); m; m = re.exec(html)) {
    try {
      saida.push(JSON.parse(m[1] ?? ''));
    } catch {
      // bloco malformado: ignora
    }
  }
  return saida;
}

function cursos(valor: unknown, achados: Objeto[] = []): Objeto[] {
  if (Array.isArray(valor)) valor.forEach((v) => cursos(v, achados));
  else if (valor && typeof valor === 'object') {
    const o = valor as Objeto;
    const tipo = o['@type'];
    if (tipo === 'Course' || (Array.isArray(tipo) && tipo.includes('Course'))) achados.push(o);
    for (const chave of ['@graph', 'mainEntity', 'itemListElement', 'item']) if (chave in o) cursos(o[chave], achados);
  }
  return achados;
}

function nome(v: unknown): string {
  if (!v || typeof v !== 'object') return '';
  const o = v as Objeto;
  return typeof o.name === 'string' ? limparLinha(textoDoHtml(o.name)) : '';
}

function lista(v: unknown): unknown[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

export function extrairDoJsonLd(html: string): ResultadoPagina {
  for (const curso of cursos(blocosJsonLd(html))) {
    const titulo = nome(curso) || 'Conteúdo';
    const grupos: GrupoImportado[] = [];
    const secoes = lista(curso.syllabusSections);
    if (secoes.length > 0) grupos.push({ nome: titulo, topicos: secoes.map((s) => ({ texto: nome(s), detalhes: [] })) });
    for (const parte of lista(curso.hasPart)) {
      const filhos = lista((parte as Objeto | null)?.hasPart);
      if (filhos.length > 0) grupos.push({ nome: nome(parte), topicos: filhos.map((f) => ({ texto: nome(f), detalhes: [] })) });
      else if (nome(parte)) (grupos[0] ??= { nome: titulo, topicos: [] }).topicos.push({ texto: nome(parte), detalhes: [] });
    }
    const r = fechar(grupos);
    if (r.ok) return r;
  }
  return { ok: false, erro: 'SEM_SUMARIO' };
}

// ---- comum ----

function fechar(grupos: GrupoImportado[]): ResultadoPagina {
  let total = 0;
  let truncado = false;
  const limpos = grupos
    .filter((g) => g.nome)
    .map((g) => {
      const vistos = new Set<string>();
      const topicos = g.topicos.filter((t) => {
        const chave = t.texto.toLowerCase();
        if (!topicoValido(t.texto) || vistos.has(chave)) return false;
        vistos.add(chave);
        if (total >= LIMITE_LINHAS) {
          truncado = true;
          return false;
        }
        total++;
        return true;
      });
      return { nome: g.nome, topicos };
    });
  const sumario = fecharSumario(limpos, 0, truncado);
  return sumario.totalTopicos >= MINIMO_TOPICOS ? { ok: true, sumario } : { ok: false, erro: 'SEM_SUMARIO' };
}

export function extrairDaPagina(html: string, nomePadrao?: string): ResultadoPagina {
  const estruturado = extrairDoJsonLd(html);
  return estruturado.ok ? estruturado : extrairDaEstrutura(html, nomePadrao);
}
