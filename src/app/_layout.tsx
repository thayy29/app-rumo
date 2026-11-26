import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';

import { useBancoPronto } from '@/data/preparar';
import '@/platform/notificacoes';
import { useCores } from '@/ui/useCores';

export default function RootLayout() {
  const c = useCores();
  // As migrações rodam antes de qualquer tela (ADR-002).
  const { pronto: success, erro: error } = useBancoPronto();

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: c.fundo }}>
        <Text style={{ color: c.alerta, fontSize: 17 }}>Algo saiu do lugar ao preparar seus dados: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.fundo }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Pilha única, sem abas (ADR-007).
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.fundo } }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="inicio" options={{ animation: 'fade' }} />
        <Stack.Screen name="comecar/estudo" />
        <Stack.Screen name="comecar/sumario" />
        <Stack.Screen name="comecar/ate-onde" />
        <Stack.Screen name="hoje" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </>
  );
}
