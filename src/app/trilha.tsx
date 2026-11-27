import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { FASE, FASES, type Fase } from '@/base';
import { adicionarTarefa, alternarFeita, apagarTarefaPropria } from '@/features/track';
import { useTrackAtiva } from '@/features/useTrackAtiva';
import { Grupo, Tela } from '@/ui/componentes';
import { LinhaTarefa, Separador, Topo } from '@/ui/estudio';
import { Simbolo } from '@/ui/Simbolo';
import { corDaFase, espaco, raio, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';
import { voltarOuHoje } from '@/ui/voltar';

// Trilha (FR-023 e FR-025): todas as fases e tarefas. Marcar, desmarcar e acrescentar as suas.
export default function Trilha() {
  const c = useCores();
  const { track, tarefas, fase } = useTrackAtiva();
  const [adicionando, setAdicionando] = useState<Fase | null>(null);
  const [texto, setTexto] = useState('');
  // Fases já feitas ficam fechadas; um toque no título abre.
  const [abertas, setAbertas] = useState<Set<Fase>>(new Set());

  if (!track) return null;

  function salvar(f: Fase) {
    if (!track) return;
    adicionarTarefa(track.id, f, texto);
    setTexto('');
    setAdicionando(null);
  }

  return (
    <Tela>
      <Topo titulo="Trilha" apoio={track.nome} aoVoltar={voltarOuHoje} />
      {FASES.map((f) => {
        const cor = corDaFase[f];
        const daFase = tarefas.filter((t) => t.fase === f && (t.tipo === 'tarefa' || t.escolhida));
        const feitas = daFase.filter((t) => t.feita).length;
        const cardapio = tarefas.filter((t) => t.fase === f && t.tipo === 'cardapio');
        const atual = f === fase;
        const completa = daFase.length > 0 && feitas === daFase.length && !atual;
        const aberta = !completa || abertas.has(f);
        const alternar = () =>
          setAbertas((a) => {
            const n = new Set(a);
            if (n.has(f)) n.delete(f);
            else n.add(f);
            return n;
          });
        return (
          <View key={f} style={{ gap: espaco.s }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: aberta }}
              disabled={!completa}
              onPress={alternar}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, minHeight: 32 }}
            >
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: cor }} />
              <Text style={[tipo.corpoForte, { color: c.texto, flex: 1 }]}>
                {FASE[f].numero}. {FASE[f].nome}
                {atual ? <Text style={[tipo.nota, { color: cor }]}> agora</Text> : null}
              </Text>
              <Text style={[tipo.nota, { color: feitas === daFase.length && daFase.length > 0 ? cor : c.apoio, fontVariant: ['tabular-nums'] }]}>
                {completa ? (aberta ? 'fechar' : `${feitas}/${daFase.length} ✓`) : `${feitas}/${daFase.length}`}
              </Text>
            </Pressable>
            {aberta ? (
              <Grupo estilo={atual ? { borderColor: cor } : undefined}>
                {daFase.map((t, i) => (
                  <View key={t.id}>
                    {i > 0 ? <Separador /> : null}
                    <LinhaTarefa
                      texto={t.texto}
                      detalhe={t.secao ?? t.grupo}
                      feita={t.feita}
                      cor={cor}
                      aoMarcar={() => alternarFeita(t.id)}
                      direita={
                        t.baseId === null ? (
                          <Pressable accessibilityRole="button" accessibilityLabel={`Apagar ${t.texto}`} hitSlop={10} onPress={() => apagarTarefaPropria(t.id)}>
                            <Simbolo name="xmark" size={14} tintColor={c.apoio} />
                          </Pressable>
                        ) : undefined
                      }
                    />
                  </View>
                ))}
                {cardapio.length > 0 ? (
                  <>
                    <Separador />
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push('/automacao')}
                      style={{ paddingVertical: 14, paddingHorizontal: espaco.l }}
                    >
                      <Text style={[tipo.subtitulo, { color: cor, fontWeight: '600' }]}>
                        Escolher automações ({cardapio.filter((t) => t.escolhida).length} escolhidas)
                      </Text>
                    </Pressable>
                  </>
                ) : null}
                <Separador />
                {adicionando === f ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: espaco.m }}>
                    <TextInput
                      value={texto}
                      onChangeText={setTexto}
                      autoFocus
                      maxLength={110}
                      returnKeyType="done"
                      onSubmitEditing={() => salvar(f)}
                      placeholder="Verbo + alvo: ex. gravar o vocal do BREAK"
                      placeholderTextColor={c.apoio}
                      accessibilityLabel={`Nova tarefa em ${FASE[f].nome}`}
                      style={[
                        tipo.subtitulo,
                        { flex: 1, height: 44, borderRadius: raio.celula, backgroundColor: c.celula2, color: c.texto, paddingHorizontal: 12 },
                      ]}
                    />
                    <Pressable accessibilityRole="button" onPress={() => salvar(f)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }}>
                      <Text style={[tipo.subtitulo, { color: cor, fontWeight: '700' }]}>Salvar</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setTexto('');
                      setAdicionando(f);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: espaco.l }}
                  >
                    <Simbolo name="plus" size={15} tintColor={c.apoio} />
                    <Text style={[tipo.subtitulo, { color: c.apoio }]}>Adicionar tarefa</Text>
                  </Pressable>
                )}
              </Grupo>
            ) : null}
          </View>
        );
      })}
    </Tela>
  );
}
