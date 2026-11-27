import { useEffect, useRef } from 'react';

export type Audio = { nome: string; bytes: Uint8Array };

async function ler(arquivo: File): Promise<Audio> {
  return { nome: arquivo.name, bytes: new Uint8Array(await arquivo.arrayBuffer()) };
}

// Na web: o seletor de arquivos do navegador.
export function escolherAudio(): Promise<Audio | null> {
  return new Promise((resolver) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.wav,audio/wav,audio/x-wav';
    input.onchange = () => {
      const f = input.files?.[0];
      resolver(f ? ler(f) : null);
    };
    input.oncancel = () => resolver(null);
    input.click();
  });
}

// Arrastar o WAV para a janela, enquanto a tela estiver aberta.
export function useSoltarArquivo(aoSoltar: (a: Audio) => void): void {
  const ref = useRef(aoSoltar);
  useEffect(() => {
    ref.current = aoSoltar;
  });
  useEffect(() => {
    const sobre = (e: DragEvent) => e.preventDefault();
    const soltar = (e: DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer?.files?.[0];
      if (f) void ler(f).then((a) => ref.current(a));
    };
    window.addEventListener('dragover', sobre);
    window.addEventListener('drop', soltar);
    return () => {
      window.removeEventListener('dragover', sobre);
      window.removeEventListener('drop', soltar);
    };
  }, []);
}
