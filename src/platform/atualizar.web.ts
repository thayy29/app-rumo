import { useEffect } from 'react';

// O GitHub Pages pede cache de ~10 min e o app da tela de início do iPhone às vezes guarda mais.
// Cada publicação grava versao.json com a mesma versão compilada no app (EXPO_PUBLIC_VERSAO).
// Ao abrir, e ao voltar para o app, compara as duas: se mudou, recarrega uma vez com a URL
// marcada pela versão nova, o que fura o cache do index.html.
const VERSAO = process.env.EXPO_PUBLIC_VERSAO ?? '';
const CHAVE = 'rumo.atualizou-para';

async function verificar() {
  if (!VERSAO) return; // build local, sem publicação
  const script = [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src') ?? '').find((s) => s.includes('/_expo/'));
  const base = script ? script.slice(0, script.indexOf('/_expo/')) : '';
  try {
    const resposta = await fetch(`${base}/versao.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!resposta.ok) return;
    const { versao } = (await resposta.json()) as { versao?: string };
    if (!versao || versao === VERSAO) return;
    if (sessionStorage.getItem(CHAVE) === versao) return; // já tentou nesta sessão: não entra em loop
    sessionStorage.setItem(CHAVE, versao);
    window.location.replace(`${base}/?v=${encodeURIComponent(versao)}`);
  } catch {
    // sem internet ou sem versao.json: segue com a versão aberta
  }
}

export function useAtualizacaoWeb(): void {
  useEffect(() => {
    void verificar();
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') void verificar();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => document.removeEventListener('visibilitychange', aoVoltar);
  }, []);
}
