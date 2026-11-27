import { Redirect } from 'expo-router';

import { blocoAberto } from '@/features/bloco';
import { existeTrack } from '@/features/track';

// Toda abertura decide a primeira tela (FR-004): bloco aberto → Foco (mesmo que o tempo tenha
// acabado com o app fechado); sem track → Início; com track → Hoje.
export default function Entrada() {
  if (blocoAberto()) return <Redirect href="/foco" />;
  return <Redirect href={existeTrack() ? '/hoje' : '/inicio'} />;
}
