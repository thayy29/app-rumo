import { Alert } from 'react-native';

// Pergunta de confirmação com duas opções. No iPhone usa o alerta nativo; na web, confirmar.web.ts.
export function confirmar(opcoes: { titulo: string; mensagem: string; confirmar: string; destrutivo?: boolean }): Promise<boolean> {
  return new Promise((resolver) => {
    Alert.alert(
      opcoes.titulo,
      opcoes.mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
        { text: opcoes.confirmar, style: opcoes.destrutivo ? 'destructive' : 'default', onPress: () => resolver(true) },
      ],
      { cancelable: true, onDismiss: () => resolver(false) },
    );
  });
}
