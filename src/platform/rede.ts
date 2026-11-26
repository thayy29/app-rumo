// Única saída de rede do app (ADR-014): baixar a página de curso que a própria
// pessoa colou. Nenhum dado dela é enviado; é um GET simples, sem cookies nem identificação.

export async function baixarPagina(url: string, limiteMs = 15_000): Promise<string> {
  const controle = new AbortController();
  const tempo = setTimeout(() => controle.abort(), limiteMs);
  try {
    const resposta = await fetch(url, {
      signal: controle.signal,
      credentials: 'omit',
      headers: { Accept: 'text/html', 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' },
    });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return await resposta.text();
  } finally {
    clearTimeout(tempo);
  }
}
