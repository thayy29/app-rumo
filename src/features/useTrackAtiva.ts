import { useMemo } from 'react';

import { useAoVivo } from '@/data/aoVivo';
import { faltaEscolherAutomacao, faseVigente, progresso, proximaTarefa } from '@/domain/trilha';
import { consultaTarefas, consultaTrackAtiva } from '@/features/track';

// A track aberta e o estado da trilha dela, ao vivo, para as telas.
export function useTrackAtiva() {
  const { data: tracks } = useAoVivo(consultaTrackAtiva());
  const track = tracks[0];
  const trackId = track?.id ?? '';
  const { data: tarefas } = useAoVivo(consultaTarefas(trackId), [trackId]);

  return useMemo(() => {
    const estado = tarefas.map((t) => ({ ...t, feita: t.feitaEm !== null }));
    const fase = track ? faseVigente(estado, track.faseAtual) : null;
    return {
      track,
      tarefas: estado,
      fase, // null: terminada
      proxima: fase ? proximaTarefa(estado, fase) : undefined,
      progresso: track ? progresso(estado, track.faseAtual) : 0,
      faltaEscolherAutomacao: faltaEscolherAutomacao(estado),
    };
  }, [track, tarefas]);
}
