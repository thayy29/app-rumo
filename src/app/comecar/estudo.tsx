import { Simbolo, type NomeSimbolo } from '@/ui/Simbolo';
import { router } from 'expo-router';
import { type ComponentRef, useRef } from 'react';
import { Pressable, type ScrollView, Text, TextInput, View } from 'react-native';

import { useRascunho, type TipoEstudo } from '@/state/rascunho';
import { Botao, Destaque, Etapas, Fala, Icone, Rotulo, Tela } from '@/ui/componentes';
import { raio, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

const TIPOS: { id: TipoEstudo; rotulo: string; simbolo: NomeSimbolo; exemplo: string }[] = [
  { id: 'certificacao', rotulo: 'Certificação', simbolo: 'list.bullet', exemplo: 'Ex.: AWS Cloud Practitioner' },
  { id: 'curso', rotulo: 'Curso online', simbolo: 'laptopcomputer', exemplo: 'Ex.: React do zero' },
  { id: 'idioma', rotulo: 'Idioma', simbolo: 'book', exemplo: 'Ex.: Inglês B2' },
  { id: 'outro', rotulo: 'Outro estudo', simbolo: 'pencil', exemplo: 'Ex.: Estatística básica' },
];

// Começar 1 (FR-001): tipo e nome do estudo que ficou pela metade.
export default function ComecarEstudo() {
  const c = useCores();
  const { tipo: escolhido, nome, definir } = useRascunho();
  const atual = TIPOS.find((t) => t.id === escolhido) ?? TIPOS[0]!;
  const valido = nome.trim().length > 0;
  const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);

  return (
    <Tela refRolagem={rolagem} rodape={<Botao desabilitado={!valido} onPress={() => router.push('/comecar/sumario')}>Continuar</Botao>}>
        <Etapas atual={1} total={3} />
        <Fala>
          Qual estudo <Destaque>ficou pela metade</Destaque>?
        </Fala>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }} accessibilityRole="radiogroup">
          {TIPOS.map((t) => {
            const on = t.id === escolhido;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => definir({ tipo: t.id })}
                style={({ pressed }) => ({
                  width: '48.5%',
                  height: 112,
                  borderRadius: raio.cartao,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  backgroundColor: on ? c.selecao : c.celula,
                  borderWidth: 2,
                  borderColor: on ? c.acao : 'transparent',
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                {on ? (
                  <View style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: c.destaque, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: c.destaqueTinta }}>
                    <Simbolo name="checkmark" size={11} weight="bold" tintColor="#2A2722" />
                  </View>
                ) : null}
                <Icone simbolo={t.simbolo} />
                <Text style={[tipo.corpoForte, { color: c.texto, fontSize: 15, letterSpacing: -0.24 }]}>{t.rotulo}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: 12 }}>
          <Rotulo>Nome</Rotulo>
          <TextInput
            value={nome}
            onChangeText={(v) => definir({ nome: v })}
            placeholder={atual.exemplo}
            placeholderTextColor={c.apoio}
            maxLength={60}
            returnKeyType="next"
            onSubmitEditing={() => valido && router.push('/comecar/sumario')}
            onFocus={() => setTimeout(() => rolagem.current?.scrollToEnd({ animated: true }), 250)}
            accessibilityLabel="Nome do estudo"
            style={[tipo.corpo, { height: 52, borderRadius: raio.celula, backgroundColor: c.celula, color: c.texto, paddingHorizontal: 16 }]}
          />
        </View>
    </Tela>
  );
}
