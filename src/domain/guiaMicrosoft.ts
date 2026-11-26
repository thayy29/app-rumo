// Lê o guia de estudo de uma certificação Microsoft (learn.microsoft.com) e monta módulos e tópicos.
// Estrutura do guia: seção "Skills measured" / "Habilidades medidas" (h2), áreas com peso na prova (h3),
// subtemas (h4) e objetivos em lista (li). Áreas viram módulos, subtemas viram tópicos e os objetivos
// ficam como "o que estudar" dentro de cada tópico. Funções puras: o download fica em platform/rede.

import { fecharSumario, type GrupoImportado, type SumarioImportado } from './sumario';

const HOST = /^(?:[a-z0-9-]+\.)*learn\.microsoft\.com$/i;
const INICIO = /(skills measured|habilidades medidas|compet[êe]ncias medidas|habilidades evaluadas)/i;
const PESO = /\d{1,3}\s*[–—-]\s*\d{1,3}\s*%/;

export type ErroGuia = 'LINK_INVALIDO' | 'NAO_E_MICROSOFT_LEARN' | 'SEM_HABILIDADES';

// Aceita o link do guia de estudo e também o da página do exame (troca para o guia).
export function normalizarLinkGuia(entrada: string): { ok: true; url: string } | { ok: false; erro: ErroGuia } {
  let url: URL;
  try {
    url = new URL(entrada.trim());
  } catch {
    return { ok: false, erro: 'LINK_INVALIDO' };
  }
  if (!/^https?:$/.test(url.protocol)) return { ok: false, erro: 'LINK_INVALIDO' };
  if (!HOST.test(url.hostname)) return { ok: false, erro: 'NAO_E_MICROSOFT_LEARN' };

  const exame = url.pathname.match(/^(\/[a-z]{2}-[a-z]{2})?\/credentials\/certifications\/exams\/([a-z0-9-]+)\/?$/i);
  if (exame) {
    const idioma = exame[1] ?? '';
    return { ok: true, url: `https://learn.microsoft.com${idioma}/credentials/certifications/resources/study-guides/${exame[2]}` };
  }
  return { ok: true, url: `https://learn.microsoft.com${url.pathname}` };
}

const ENTIDADES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—' };

export function textoDoHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, nome: string) => ENTIDADES[nome.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

type Bloco = { tag: 'h2' | 'h3' | 'h4' | 'li'; texto: string };

function blocos(html: string): Bloco[] {
  const semRuido = html.replace(/<(script|style|nav|header|footer)\b[\s\S]*?<\/\1>/gi, ' ');
  const re = /<(h2|h3|h4|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const lista: Bloco[] = [];
  for (let m = re.exec(semRuido); m; m = re.exec(semRuido)) {
    const texto = textoDoHtml(m[2] ?? '');
    if (texto) lista.push({ tag: (m[1] ?? '').toLowerCase() as Bloco['tag'], texto });
  }
  return lista;
}

export function extrairGuiaMicrosoft(html: string): { ok: true; sumario: SumarioImportado } | { ok: false; erro: ErroGuia } {
  const todos = blocos(html);

  // Começa na seção de habilidades; sem ela, na primeira área com peso na prova.
  let inicio = todos.findIndex((b) => b.tag === 'h2' && INICIO.test(b.texto));
  if (inicio < 0) inicio = todos.findIndex((b) => b.tag === 'h3' && PESO.test(b.texto)) - 1;
  if (inicio < -1) return { ok: false, erro: 'SEM_HABILIDADES' };

  const grupos: GrupoImportado[] = [];
  let grupo: GrupoImportado | undefined;
  let temSubtemas = false;
  for (const b of todos.slice(inicio + 1)) {
    if (b.tag === 'h2') break;
    if (b.tag === 'h3') {
      grupo = { nome: b.texto, topicos: [] };
      grupos.push(grupo);
      temSubtemas = false;
    } else if (b.tag === 'h4' && grupo) {
      grupo.topicos.push({ texto: b.texto, detalhes: [] });
      temSubtemas = true;
    } else if (b.tag === 'li' && grupo) {
      // Com subtemas, o objetivo é "o que estudar" do subtema; sem subtemas, cada objetivo vira um tópico.
      if (temSubtemas) grupo.topicos[grupo.topicos.length - 1]?.detalhes.push(b.texto);
      else grupo.topicos.push({ texto: b.texto, detalhes: [] });
    }
  }

  const sumario = fecharSumario(grupos);
  if (sumario.totalTopicos === 0) return { ok: false, erro: 'SEM_HABILIDADES' };
  return { ok: true, sumario };
}
