import { Redirect } from 'expo-router';

import { blocoAberto } from '@/features/bloco';
import { consultaEstudoAtivo } from '@/features/comecar';

// Toda abertura decide a primeira tela (FR-004): bloco aberto → Foco (mesmo que o tempo tenha
// acabado com o app fechado); sem estudo ativo → Início; com estudo ativo → Hoje.
export default function Entrada() {
  if (blocoAberto()) return <Redirect href="/foco" />;
  const existe = consultaEstudoAtivo().get();
  return <Redirect href={existe ? '/hoje' : '/inicio'} />;
}
