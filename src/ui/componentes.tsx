import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { router } from 'expo-router';
import { type ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mascote, type Expressao } from './Mascote';
import { espaco, raio, tipo, type Cores } from './tokens';
import { useCores } from './useCores';

function useEstilos() {
  const c = useCores();
  return useMemo(() => ({ c, s: criar(c) }), [c]);
}

// ---------- estrutura da tela ----------

export function Tela({ children, rodape }: { children: ReactNode; rodape?: ReactNode }) {
  const { c } = useEstilos();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.fundo, paddingTop: insets.top + espaco.s }}>
      <View style={{ flex: 1, paddingHorizontal: espaco.xl, gap: espaco.l }}>{children}</View>
      {rodape ? (
        <View style={{ paddingHorizontal: espaco.xl, paddingTop: espaco.m, paddingBottom: Math.max(insets.bottom, espaco.l), gap: espaco.s }}>
          {rodape}
        </View>
      ) : null}
    </View>
  );
}

// ---------- texto ----------

export function Destaque({ children }: { children: ReactNode }) {
  const { c } = useEstilos();
  return <Text style={{ color: c.destaqueTinta, fontWeight: '700' }}>{children}</Text>;
}

export function Fala({ children, expressao = 'neutro', tamanho = 56 }: { children: ReactNode; expressao?: Expressao; tamanho?: number }) {
  const { s } = useEstilos();
  return (
    <View style={s.falaLinha} accessible accessibilityRole="header">
      <Mascote tamanho={tamanho} expressao={expressao} />
      <View style={s.balao}>
        <Text style={s.balaoTexto}>{children}</Text>
      </View>
    </View>
  );
}

export function Rotulo({ children }: { children: ReactNode }) {
  const { s } = useEstilos();
  return <Text style={s.rotulo}>{children}</Text>;
}

// ---------- botões ----------

export function Botao({
  children,
  onPress,
  tipo: variante = 'principal',
  desabilitado = false,
  rotuloAcessivel,
}: {
  children: ReactNode;
  onPress: () => void;
  tipo?: 'principal' | 'texto';
  desabilitado?: boolean;
  rotuloAcessivel?: string;
}) {
  const { c, s } = useEstilos();
  const principal = variante === 'principal';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        principal ? s.botaoPrincipal : s.botaoTexto,
        desabilitado && { opacity: 0.4 },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.88 },
      ]}
    >
      <Text style={[tipo.corpoForte, { color: principal ? c.acaoTexto : c.link, fontWeight: principal ? '600' : '400' }]}>{children}</Text>
    </Pressable>
  );
}

export function BotaoCircular({ simbolo, rotulo, onPress }: { simbolo: SymbolViewProps['name']; rotulo: string; onPress: () => void }) {
  const { c, s } = useEstilos();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={rotulo} onPress={onPress} hitSlop={6} style={({ pressed }) => [s.circular, pressed && { opacity: 0.7 }]}>
      <SymbolView name={simbolo} size={17} weight="semibold" tintColor={c.texto} />
    </Pressable>
  );
}

// Barra do topo do fluxo de começo: voltar + segmentos de progresso.
export function Etapas({ atual, total, voltar = true }: { atual: number; total: number; voltar?: boolean }) {
  const { c, s } = useEstilos();
  return (
    <View style={s.etapas} accessible accessibilityLabel={`Etapa ${atual} de ${total}`}>
      {voltar ? <BotaoCircular simbolo="chevron.left" rotulo="Voltar" onPress={() => router.back()} /> : <View style={{ width: 44 }} />}
      <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < atual ? c.acao : c.linha }} />
        ))}
      </View>
    </View>
  );
}

// ---------- blocos de conteúdo ----------

export function Grupo({ children, estilo }: { children: ReactNode; estilo?: ViewStyle }) {
  const { s } = useEstilos();
  return <View style={[s.grupo, estilo]}>{children}</View>;
}

export function Cartao({ children, estilo }: { children: ReactNode; estilo?: ViewStyle }) {
  const { s } = useEstilos();
  return <View style={[s.cartao, estilo]}>{children}</View>;
}

export function Icone({ simbolo, tamanho = 20, fundo = true }: { simbolo: SymbolViewProps['name']; tamanho?: number; fundo?: boolean }) {
  const { c } = useEstilos();
  const icone = <SymbolView name={simbolo} size={tamanho} tintColor={c.acao} />;
  if (!fundo) return icone;
  return (
    <View style={{ width: tamanho * 2, height: tamanho * 2, borderRadius: tamanho, backgroundColor: c.tinta, alignItems: 'center', justifyContent: 'center' }}>
      {icone}
    </View>
  );
}

export function Barra({ porcento }: { porcento: number }) {
  const { c } = useEstilos();
  const p = Math.max(0, Math.min(100, porcento));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: p }}
      style={{ height: 6, borderRadius: 3, backgroundColor: c.linha, overflow: 'hidden' }}
    >
      <View style={{ width: `${p}%`, height: '100%', borderRadius: 3, backgroundColor: c.destaqueTinta }} />
    </View>
  );
}

// ---------- estilos ----------

function criar(c: Cores) {
  return StyleSheet.create({
    falaLinha: { flexDirection: 'row', alignItems: 'flex-end', gap: espaco.s + 2 },
    balao: {
      flex: 1,
      backgroundColor: c.celula,
      borderRadius: 22,
      borderBottomLeftRadius: 7,
      paddingVertical: 14,
      paddingHorizontal: 17,
      shadowColor: c.sombra,
      shadowOpacity: 0.07,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    balaoTexto: { ...tipo.corpoForte, color: c.texto },
    rotulo: { ...tipo.nota, color: c.apoio, paddingHorizontal: espaco.l, marginBottom: -espaco.s },
    botaoPrincipal: { height: 52, borderRadius: raio.botao, backgroundColor: c.acao, alignItems: 'center', justifyContent: 'center', paddingHorizontal: espaco.xl },
    botaoTexto: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: espaco.m },
    circular: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.celula,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.sombra,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    etapas: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    grupo: { backgroundColor: c.celula, borderRadius: raio.grupo, overflow: 'hidden' },
    cartao: {
      backgroundColor: c.celula,
      borderRadius: raio.cartao,
      padding: espaco.l,
      shadowColor: c.sombra,
      shadowOpacity: 0.05,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
    },
  });
}
