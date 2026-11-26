import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useRascunho } from '@/state/rascunho';
import { Botao, Tela } from '@/ui/componentes';
import { Marca } from '@/ui/Marca';
import { Mascote, TrilhaComBandeira } from '@/ui/Mascote';
import { tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

// Tela de Início (canvas "1 · Início"). "Já tenho uma conta" fica oculto na v0.1 (ADR-003).
export default function Inicio() {
  const c = useCores();
  const { width } = useWindowDimensions();
  const limpar = useRascunho((s) => s.limpar);

  return (
    <Tela
      rodape={
        <>
          <Botao
            onPress={() => {
              limpar();
              router.push('/comecar/estudo');
            }}
          >
            Começar
          </Botao>
          <Text style={[tipo.nota, { color: c.apoio, textAlign: 'center', marginTop: 6 }]}>Sem cadastro. Seus dados ficam só no seu celular.</Text>
        </>
      }
    >
      <Svg style={StyleSheet.absoluteFill} width={width} height="100%" pointerEvents="none">
        <Defs>
          <RadialGradient id="halo" cx="50%" cy="34%" r="60%">
            <Stop offset="0" stopColor={c.mascote} stopOpacity={0.32} />
            <Stop offset="0.45" stopColor={c.mascote} stopOpacity={0.1} />
            <Stop offset="1" stopColor={c.mascote} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#halo)" />
      </Svg>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <View style={{ width: 260, height: 170, alignItems: 'center', justifyContent: 'flex-end' }}>
          <View style={{ position: 'absolute', right: 0, bottom: 4 }}>
            <TrilhaComBandeira largura={130} />
          </View>
          <View style={{ marginRight: 70 }}>
            <Mascote tamanho={150} expressao="feliz" />
          </View>
        </View>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Marca altura={56} />
          <Text style={[tipo.corpo, { color: c.apoio, textAlign: 'center' }]}>
            Retome o estudo que você largou.{'\n'}Sem começar do zero.
          </Text>
        </View>
      </View>
    </Tela>
  );
}
