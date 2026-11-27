import { Text, View } from 'react-native';

import { ESTILO, SECAO } from '@/base';
import { mapaDeArranjo, minutosESegundos, type Ajustes } from '@/domain/arranjo';
import { useTrackAtiva } from '@/features/useTrackAtiva';
import { Cartao, Grupo, Tela } from '@/ui/componentes';
import { Separador, Topo } from '@/ui/estudio';
import { corDaFase, espaco, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';
import { voltarOuHoje } from '@/ui/voltar';

// Energia relativa de cada seção, para desenhar o mapa como uma onda de arranjo.
const ENERGIA: Record<string, number> = { INTRO: 0.35, GROOVE: 0.55, BUILD: 0.75, 'DROP 1': 1, BREAK: 0.45, 'BUILD 2': 0.8, 'DROP 2': 1, OUTRO: 0.35 };
const COR = corDaFase.arranjo;

// Mapa de arranjo (FR-027, nível A da integração): onde criar cada locator no Ableton.
export default function Mapa() {
  const c = useCores();
  const { track } = useTrackAtiva();
  if (!track) return null;

  // Streaming: intro e outro mais curtos, como diz a base.
  const ajustes: Ajustes = track.destino === 'streaming' ? { INTRO: Math.min(16, ESTILO[track.estilo].mapa.INTRO), OUTRO: 8 } : {};
  const mapa = mapaDeArranjo(track.estilo, track.bpm, ajustes);

  return (
    <Tela>
      <Topo titulo="Mapa de arranjo" apoio={`${ESTILO[track.estilo].nome} · ${track.bpm} BPM · ${track.destino}`} aoVoltar={voltarOuHoje} />

      <Cartao estilo={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[tipo.corpoForte, { color: c.texto }]}>{mapa.compassos} compassos</Text>
          <Text style={[tipo.corpoForte, { color: COR, fontVariant: ['tabular-nums'] }]}>{minutosESegundos(mapa.duracaoSeg)}</Text>
        </View>
        <View
          accessible
          accessibilityLabel={`Arranjo: ${mapa.secoes.map((s) => `${s.nome} ${s.compassos} compassos`).join(', ')}`}
          style={{ flexDirection: 'row', alignItems: 'flex-end', height: 72, gap: 3 }}
        >
          {mapa.secoes.map((s) => (
            <View key={s.nome} style={{ flex: s.compassos, height: `${Math.round((ENERGIA[s.nome] ?? 0.5) * 100)}%`, backgroundColor: COR, opacity: 0.35 + 0.65 * (ENERGIA[s.nome] ?? 0.5), borderRadius: 4 }} />
          ))}
        </View>
        <Text style={[tipo.nota, { color: c.apoio }]}>A altura mostra a energia de cada seção. É ponto de partida, não regra.</Text>
      </Cartao>

      <Text style={[tipo.nota, { color: c.apoio, fontWeight: '700', letterSpacing: 0.6, paddingHorizontal: 4 }]}>LOCATORS</Text>
      <Grupo>
        {mapa.secoes.map((s, i) => (
          <View key={s.nome}>
            {i > 0 ? <Separador /> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: espaco.l, gap: espaco.m }}>
              <Text style={[tipo.nota, { color: COR, fontWeight: '700', width: 42, fontVariant: ['tabular-nums'] }]}>{s.compassoInicial}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[tipo.corpoForte, { color: c.texto }]}>{s.nome}</Text>
                <Text style={[tipo.nota, { color: c.apoio }]}>
                  {s.compassos} compassos · {minutosESegundos(s.duracaoSeg)}
                </Text>
                <Text style={[tipo.nota, { color: c.texto, marginTop: 2 }]}>{SECAO[s.nome].papel}</Text>
              </View>
              <Text style={[tipo.nota, { color: c.apoio, fontVariant: ['tabular-nums'] }]}>{minutosESegundos(s.inicioSeg)}</Text>
            </View>
          </View>
        ))}
      </Grupo>
      <Text style={[tipo.nota, { color: c.apoio, paddingHorizontal: 4 }]}>
        O número da esquerda é o compasso. No Arrangement, leve o cursor até ele e crie um locator (menu Create › Add Locator) com o nome da seção.
      </Text>
    </Tela>
  );
}
