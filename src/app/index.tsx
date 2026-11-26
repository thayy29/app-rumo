import { Redirect } from 'expo-router';

import { consultaEstudoAtivo } from '@/features/comecar';

// Toda abertura decide a primeira tela: sem estudo ativo → Início; com estudo ativo → Hoje (FR-004).
export default function Entrada() {
  const existe = consultaEstudoAtivo().get();
  return <Redirect href={existe ? '/hoje' : '/inicio'} />;
}
