import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Fragment, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { porcentagem } from '@/domain/sumario';
import { consultaTopicos, marcarAteOTopico } from '@/features/comecar';
import { useRascunho } from '@/state/rascunho';
import { Botao, Cartao, Destaque, Etapas, Fala, Grupo, Rotulo, Tela } from '@/ui/componentes';
import { tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

// Começar 3 (FR-018): tocar no último tópico feito e ver a porcentagem já conquistada.
export default function AteOnde() {
  const c = useCores();
  const estudoId = useRascunho((s) => s.estudoId) ?? '';
  const limpar = useRascunho((s) => s.limpar);
  const { data: topicos } = useLiveQuery(consultaTopicos(estudoId), [estudoId]);

  const feitos = topicos.filter((t) => t.feitoEm !== null).length;
  const pct = porcentagem(feitos, topicos.length);
  const ultimoFeito = feitos - 1;

  // Agrupa preservando a ordem; guarda o índice global de cada tópico.
  const grupos = useMemo(() => {
    const lista: { id: string; nome: string; itens: { id: string; texto: string; feito: boolean; indice: number }[] }[] = [];
    topicos.forEach((t, indice) => {
      let g = lista[lista.length - 1];
      if (!g || g.id !== t.grupoId) {
        g = { id: t.grupoId, nome: t.grupo, itens: [] };
        lista.push(g);
      }
      g.itens.push({ id: t.id, texto: t.texto, feito: t.feitoEm !== null, indice });
    });
    return lista;
  }, [topicos]);

  function tocar(indice: number) {
    marcarAteOTopico(estudoId, indice === ultimoFeito ? indice - 1 : indice);
    void Haptics.selectionAsync();
  }

  return (
    <Tela
      rodape={
        <>
          <Cartao estilo={{ alignItems: 'center', gap: 4, paddingVertical: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }} accessible accessibilityLabel={`${pct} por cento já feito`}>
              <Text style={{ fontFamily: 'ui-rounded', fontSize: 40, lineHeight: 46, fontWeight: '700', color: c.texto, fontVariant: ['tabular-nums'] }}>{pct}%</Text>
              <Text style={[tipo.subtitulo, { color: c.apoio }]}>já feito</Text>
            </View>
            <Text style={[tipo.subtitulo, { color: c.apoio, textAlign: 'center' }]}>
              {pct > 0 ? 'Você não está começando do zero.' : 'Tudo bem começar daqui. Toque no último tópico que você fez.'}
            </Text>
          </Cartao>
          <Botao
            onPress={() => {
              limpar();
              router.dismissAll();
              router.replace('/hoje');
            }}
          >
            Ir para o Hoje
          </Botao>
        </>
      }
    >
      <Etapas atual={3} total={3} />
      <Fala>
        Toca no <Destaque>último tópico</Destaque> que você terminou.
      </Fala>

      <ScrollView style={{ flex: 1, marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 18 }}>
        {grupos.map((g) => {
          const feitosNoGrupo = g.itens.filter((i) => i.feito).length;
          return (
            <View key={g.id} style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Rotulo>{g.nome}</Rotulo>
                <Rotulo>
                  {feitosNoGrupo} de {g.itens.length}
                </Rotulo>
              </View>
              <Grupo>
                {g.itens.map((item, i) => (
                  <Fragment key={item.id}>
                    {i > 0 ? <View style={{ height: 0.5, backgroundColor: c.separador, marginLeft: 56 }} /> : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${item.texto}${item.feito ? ', feito' : ''}`}
                      accessibilityHint="Marca este e os anteriores como feitos"
                      onPress={() => tocar(item.indice)}
                      style={({ pressed }) => ({ minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: pressed ? c.selecao : 'transparent' })}
                    >
                      <View
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: item.feito ? c.destaque : 'transparent',
                          borderWidth: 1.5,
                          borderColor: item.feito ? c.destaqueTinta : c.linha,
                        }}
                      >
                        {item.feito ? (
                          <SymbolView name="checkmark" size={12} weight="bold" tintColor="#2A2722" />
                        ) : (
                          <Text style={{ fontSize: 12, fontWeight: '700', color: c.apoio }}>{i + 1}</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          tipo.corpo,
                          { flex: 1, color: c.texto },
                          item.indice === ultimoFeito ? { fontWeight: '600' } : item.feito ? { color: c.apoio, textDecorationLine: 'line-through' } : null,
                        ]}
                      >
                        {item.texto}
                      </Text>
                      {item.indice === ultimoFeito ? <Text style={[tipo.nota, { color: c.link, fontWeight: '600' }]}>último feito</Text> : null}
                    </Pressable>
                  </Fragment>
                ))}
              </Grupo>
            </View>
          );
        })}
      </ScrollView>
    </Tela>
  );
}
