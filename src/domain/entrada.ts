// Descobre o que a pessoa colou no campo do sumário: um link para ler ou um texto para organizar.
// Um campo só, sem ela precisar escolher o modo.

export type Entrada = { tipo: 'vazia' } | { tipo: 'link'; url: string; site: string } | { tipo: 'texto' };

const URL_SOLTA = /(?:https?:\/\/|www\.)[^\s<>"']+/i;

export function analisarEntrada(texto: string): Entrada {
  const limpo = texto.trim();
  if (!limpo) return { tipo: 'vazia' };

  const linhas = limpo.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const achado = limpo.match(URL_SOLTA);
  // É link quando o link é praticamente tudo o que foi colado (às vezes vem com o título da página junto).
  if (achado && linhas.length <= 2 && limpo.replace(achado[0], '').trim().length <= 80) {
    const bruto = achado[0].replace(/[).,;]+$/, '');
    try {
      const url = new URL(/^https?:\/\//i.test(bruto) ? bruto : `https://${bruto}`);
      if (/^https?:$/.test(url.protocol) && url.hostname.includes('.')) {
        return { tipo: 'link', url: url.toString(), site: url.hostname.replace(/^www\./, '') };
      }
    } catch {
      // não era link de verdade: trata como texto
    }
  }
  return { tipo: 'texto' };
}

export function ehSoUmLink(linhaLimpa: string): boolean {
  return /^(?:https?:\/\/|www\.)\S+$/i.test(linhaLimpa);
}
