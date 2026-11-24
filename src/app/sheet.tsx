import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useCores } from '@/ui/useCores';

// Teste 5: sheet nativa do iOS (formSheet), com alça, dois tamanhos e fechar arrastando.
export default function Sheet() {
  const c = useCores();
  return (
    <View style={{ flex: 1, padding: 24, gap: 16, backgroundColor: c.fundo }}>
      <Text style={{ color: c.texto, fontSize: 22, fontWeight: '600' }}>Sheet nativa</Text>
      <Text style={{ color: c.apoio, fontSize: 17, lineHeight: 22 }}>
        Arraste a alça para cima (tela cheia) e para baixo (fechar). O fundo deve recuar como nas sheets do
        iPhone.
      </Text>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        style={({ pressed }) => ({
          height: 52,
          borderRadius: 999,
          backgroundColor: c.acao,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: c.acaoTexto, fontSize: 17, fontWeight: '600' }}>Fechar</Text>
      </Pressable>
    </View>
  );
}
