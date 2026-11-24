import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';

import { db } from '@/data/db';
import '@/platform/notificacoes';
import { useCores } from '@/ui/useCores';
import migrations from '../../drizzle/migrations';

export default function RootLayout() {
  const c = useCores();
  // As migrações rodam antes de qualquer tela (ADR-002).
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: c.fundo }}>
        <Text style={{ color: c.alerta, fontSize: 17 }}>Erro ao preparar o banco: {error.message}</Text>
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

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: c.fundo }, headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="sheet"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.5, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 40,
          }}
        />
      </Stack>
    </>
  );
}
