import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { FASE, FASES, type Fase } from '@/base';
import { useAoVivo } from '@/data/aoVivo';
import {
  adicionarTarefa,
  alternarFeita,
  apagarModelo,
  apagarTarefaPropria,
  consultaFasesComModelo,
  consultaNotas,
  salvarModelo,
  salvarNota,
} from '@/features/track';
import { confirmar } from '@/platform/confirmar';
import { useTrackAtiva } from '@/features/useTrackAtiva';
import { Grupo, Tela } from '@/ui/componentes';
import { LinhaTarefa, Separador, Topo } from '@/ui/estudio';
import { Simbolo } from '@/ui/Simbolo';
import { corDaFase, espaco, raio, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';
import { voltarOuHoje } from '@/ui/voltar';

// Trilha (FR-023 e FR-025): todas as fases. Só a fase atual é editável; as outras abrem
// para ver o progresso. Cada fase guarda uma observação sobre o que está difícil.
export default function Trilha() {
  const c = useCores();
  const { track, tarefas, fase } = useTrackAtiva();
  const trackId = track?.id ?? '';
  const { data: notas } = useAoVivo(consultaNotas(trackId), [trackId]);
  const { data: comModelo } = useAoVivo(consultaFasesComModelo());
  const [adicionando, setAdicionando] = useState(false);
  const [texto, setTexto] = useState('');
  const [abertas, setAbertas] = useState<Set<Fase>>(new Set());

  if (!track) return null;

  async function guardarModelo(f: Fase) {
    if (!track) return;
    const sim = await confirmar({
      titulo: `Salvar o modelo de ${FASE[f].apelido}?`,
      mensagem: 'As próximas tracks começam esta fase com esta lista, incluindo as tarefas que você criou.',
      confirmar: 'Salvar modelo',
    });
    if (sim) salvarModelo(track.id, f);
  }

  async function voltarAoPadrao(f: Fase) {
    const sim = await confirmar({
      titulo: 'Voltar ao padrão do Rumo?',
      mensagem: `As próximas tracks usam a lista do Rumo em ${FASE[f].apelido}. Esta track não muda.`,
      confirmar: 'Voltar ao padrão',
    });
    if (sim) apagarModelo(f);
  }

  function salvar(f: Fase) {
    if (!track) return;
    adicionarTarefa(track.id, f, texto);
    setTexto('');
    setAdicionando(false);
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
        const aberta = atual || abertas.has(f);
        const nota = notas.find((n) => n.fase === f)?.texto ?? '';
        const situacao = atual ? 'agora' : FASES.indexOf(f) < FASES.indexOf(fase ?? 'export') || fase === null ? 'feita' : 'depois';
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
              accessibilityHint={atual ? undefined : 'Abre só para ver'}
              disabled={atual}
              onPress={alternar}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, minHeight: 36 }}
            >
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: cor, opacity: situacao === 'depois' ? 0.4 : 1 }} />
              <Text style={[tipo.corpoForte, { color: situacao === 'depois' ? c.apoio : c.texto, flex: 1 }]}>
                {FASE[f].numero}. {FASE[f].apelido} <Text style={[tipo.nota, { color: c.apoio }]}>{FASE[f].nome}</Text>
                {atual ? <Text style={[tipo.nota, { color: cor }]}> agora</Text> : null}
              </Text>
              <Text style={[tipo.nota, { color: situacao === 'feita' ? cor : c.apoio, fontVariant: ['tabular-nums'] }]}>
                {feitas}/{daFase.length}
                {situacao === 'feita' ? ' ✓' : ''}
                {!atual ? (aberta ? '  ▴' : '  ▾') : ''}
              </Text>
            </Pressable>
            {aberta ? (
              <Grupo estilo={atual ? { borderColor: cor } : { opacity: 0.85 }}>
                {!atual ? (
                  <Text style={[tipo.nota, { color: c.apoio, paddingHorizontal: espaco.l, paddingTop: 10 }]}>
                    Só para ver: edite quando a track estiver nesta fase.
                  </Text>
                ) : null}
                {daFase.map((t, i) => (
                  <View key={t.id}>
                    {i > 0 ? <Separador /> : null}
                    <LinhaTarefa
                      texto={t.texto}
                      detalhe={t.secao ?? t.grupo}
                      feita={t.feita}
                      cor={cor}
                      somenteLeitura={!atual}
                      aoMarcar={() => alternarFeita(t.id)}
                      direita={
                        atual && t.baseId === null ? (
                          <Pressable accessibilityRole="button" accessibilityLabel={`Apagar ${t.texto}`} hitSlop={10} onPress={() => apagarTarefaPropria(t.id)}>
                            <Simbolo name="xmark" size={14} tintColor={c.apoio} />
                          </Pressable>
                        ) : undefined
                      }
                    />
                  </View>
                ))}
                {atual && cardapio.length > 0 ? (
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
                {atual ? (
                  <>
                    <Separador />
                    {adicionando ? (
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
                          accessibilityLabel={`Nova tarefa em ${FASE[f].apelido}`}
                          style={[
                            tipo.subtitulo,
                            { flex: 1, height: 44, borderRadius: raio.celula, backgroundColor: c.celula2, color: c.texto, paddingHorizontal: 12 },
                          ]}
                        />
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => salvar(f)}
                          style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }}
                        >
                          <Text style={[tipo.subtitulo, { color: cor, fontWeight: '700' }]}>Salvar</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          setTexto('');
                          setAdicionando(true);
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: espaco.l }}
                      >
                        <Simbolo name="plus" size={15} tintColor={c.apoio} />
                        <Text style={[tipo.subtitulo, { color: c.apoio }]}>Adicionar tarefa</Text>
                      </Pressable>
                    )}
                    <Separador />
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingVertical: 12, paddingHorizontal: espaco.l }}>
                      <Pressable accessibilityRole="button" onPress={() => guardarModelo(f)} style={{ minHeight: 32, justifyContent: 'center' }}>
                        <Text style={[tipo.subtitulo, { color: cor, fontWeight: '600' }]}>
                          {comModelo.some((m) => m.fase === f) ? 'Atualizar meu modelo' : 'Salvar como meu modelo'}
                        </Text>
                      </Pressable>
                      {comModelo.some((m) => m.fase === f) ? (
                        <Pressable accessibilityRole="button" onPress={() => voltarAoPadrao(f)} style={{ minHeight: 32, justifyContent: 'center' }}>
                          <Text style={[tipo.nota, { color: c.apoio }]}>Usar o padrão do Rumo</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </>
                ) : null}
                <Separador />
                <Observacao key={`${f}-${nota}`} fase={f} texto={nota} editavel={atual} cor={cor} aoSalvar={(t) => salvarNota(track.id, f, t)} />
              </Grupo>
            ) : null}
          </View>
        );
      })}
    </Tela>
  );
}

// O que está difícil nesta fase. Salva ao sair do campo.
function Observacao({ fase, texto, editavel, cor, aoSalvar }: { fase: Fase; texto: string; editavel: boolean; cor: string; aoSalvar: (t: string) => void }) {
  const c = useCores();
  const [valor, setValor] = useState(texto);
  if (!editavel) {
    return texto ? (
      <View style={{ padding: espaco.l, gap: 4 }}>
        <Text style={[tipo.nota, { color: cor, fontWeight: '700' }]}>Dificuldades</Text>
        <Text style={[tipo.subtitulo, { color: c.texto }]}>{texto}</Text>
      </View>
    ) : null;
  }
  return (
    <View style={{ padding: espaco.l, gap: 6 }}>
      <Text style={[tipo.nota, { color: cor, fontWeight: '700' }]}>Dificuldades desta fase</Text>
      <TextInput
        value={valor}
        onChangeText={setValor}
        onBlur={() => valor !== texto && aoSalvar(valor)}
        multiline
        maxLength={600}
        placeholder="O que está travando? Ex.: não sei quando o baixo entra no GROOVE"
        placeholderTextColor={c.apoio}
        accessibilityLabel={`Dificuldades em ${FASE[fase].apelido}`}
        style={[
          tipo.subtitulo,
          { minHeight: 72, borderRadius: raio.celula, backgroundColor: c.celula2, color: c.texto, padding: 12, textAlignVertical: 'top' },
        ]}
      />
      <Text style={[tipo.nota, { color: c.apoio }]}>Salva sozinho quando você sai do campo.</Text>
    </View>
  );
}
