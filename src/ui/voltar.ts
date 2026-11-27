import { router } from 'expo-router';

// Volta uma tela; aberta direto pelo link (sem histórico), cai no Hoje.
export function voltarOuHoje(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/hoje');
}
