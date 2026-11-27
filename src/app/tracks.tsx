import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ESTILO, FASE } from '@/base';
import { useAoVivo } from '@/data/aoVivo';
import { consultaTracks, escolherTrack } from '@/features/track';
import { Botao, Grupo, Tela } from '@/ui/componentes';
import { Separador, Topo } from '@/ui/estudio';
import { corDaFase, espaco, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';
import { voltarOuHoje } from '@/ui/voltar';

// Várias tracks (FR-030): o Hoje mostra uma por vez; aqui se troca ou começa outra.
export default function Tracks() {
  const c = useCores();
  const { data: tracks } = useAoVivo(consultaTracks());
  const terminadas = tracks.filter((t) => t.terminadaEm !== null).length;

  function abrir(id: string) {
    escolherTrack(id);
    voltarOuHoje();
  }

  return (
    <Tela
      rodape={
        <>
          <Botao onPress={() => router.push('/nova-track')}>Nova track</Botao>
          <Botao tipo="texto" onPress={() => router.push('/diagnostico')}>
            Diagnóstico pelo WAV
          </Botao>
        </>
      }
    >
      <Topo titulo="Minhas tracks" apoio={terminadas === 1 ? '1 terminada' : `${terminadas} terminadas`} aoVoltar={voltarOuHoje} />
      <Grupo>
        {tracks.map((t, i) => {
          const terminada = t.terminadaEm !== null;
          const cor = terminada ? c.apoio : corDaFase[t.faseAtual];
          return (
            <View key={t.id}>
              {i > 0 ? <Separador /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t.nome}, ${terminada ? 'terminada' : FASE[t.faseAtual].nome}${i === 0 ? ', aberta no Hoje' : ''}`}
                onPress={() => abrir(t.id)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: espaco.m, paddingVertical: 14, paddingHorizontal: espaco.l, opacity: pressed ? 0.7 : 1 })}
              >
                <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: cor }} />
                <View style={{ flex: 1 }}>
                  <Text style={[tipo.corpoForte, { color: c.texto }]} numberOfLines={1}>
                    {t.nome}
                  </Text>
                  <Text style={[tipo.nota, { color: c.apoio }]}>
                    {ESTILO[t.estilo].nome} · {t.bpm} BPM · {terminada ? 'terminada' : `${FASE[t.faseAtual].numero}. ${FASE[t.faseAtual].nome}`}
                  </Text>
                </View>
                {i === 0 ? <Text style={[tipo.nota, { color: c.acao, fontWeight: '700' }]}>aberta</Text> : null}
              </Pressable>
            </View>
          );
        })}
      </Grupo>
    </Tela>
  );
}
