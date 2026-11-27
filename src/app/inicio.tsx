import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Botao, Tela } from '@/ui/componentes';
import { Knob } from '@/ui/Knob';
import { Marca } from '@/ui/Marca';
import { tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

// Início: o Knob, a marca e a promessa. Sem cadastro (ADR-003).
export default function Inicio() {
  const c = useCores();
  const { width } = useWindowDimensions();

  return (
    <Tela
      rodape={
        <>
          <Botao onPress={() => router.push('/nova-track')}>Começar uma track</Botao>
          <Botao tipo="texto" onPress={() => router.push('/diagnostico')}>
            Já tenho uma track: onde estou?
          </Botao>
          <Text style={[tipo.nota, { color: c.apoio, textAlign: 'center', marginTop: 6 }]}>Sem cadastro. Seus dados ficam só no seu celular.</Text>
        </>
      }
    >
      <Svg style={StyleSheet.absoluteFill} width={width} height="100%" pointerEvents="none">
        <Defs>
          <RadialGradient id="halo" cx="50%" cy="36%" r="60%">
            <Stop offset="0" stopColor={c.acao} stopOpacity={0.16} />
            <Stop offset="0.5" stopColor={c.acao} stopOpacity={0.04} />
            <Stop offset="1" stopColor={c.acao} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#halo)" />
      </Svg>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <Knob tamanho={170} expressao="feliz" valor={0.8} />
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Marca altura={56} />
          <Text style={[tipo.corpo, { color: c.apoio, textAlign: 'center' }]}>
            Saia do loop e termine suas tracks.{'\n'}Uma tarefa de 25 minutos por vez.
          </Text>
        </View>
      </View>
    </Tela>
  );
}
