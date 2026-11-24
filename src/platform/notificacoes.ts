import * as Notifications from 'expo-notifications';

// Só notificações locais: funcionam no Expo Go e sem servidor. Ver ADR-008.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function pedirPermissao(): Promise<boolean> {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

export async function agendarFimDoBloco(fimEm: number): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Bloco feito', body: 'E o tópico? Toque para contar como foi.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fimEm },
  });
}

export async function agendarEmSegundos(segundos: number): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Rumo', body: `Teste: lembrete de ${segundos} segundos.` },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: segundos },
  });
}

export async function agendarLembreteDiario(hora: number, minuto: number): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Rumo', body: 'Seu próximo tópico está esperando. 10 minutos já contam.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hora, minute: minuto },
  });
}

export async function cancelar(id: string | null | undefined): Promise<void> {
  if (id) await Notifications.cancelScheduledNotificationAsync(id);
}

export async function pendentes(): Promise<number> {
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}
