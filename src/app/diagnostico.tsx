import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { FASE, FASES } from '@/base';
import { diagnosticar, medir, type Diagnostico } from '@/domain/diagnostico';
import { lerCabecalho, medirBlocos, WavInvalido } from '@/domain/wav';
import { avancarPara } from '@/features/track';
import { useTrackAtiva } from '@/features/useTrackAtiva';
import { escolherAudio, useSoltarArquivo, type Audio } from '@/platform/escolherAudio';
import { Botao, Cartao, Destaque, Fala, Grupo, Tela } from '@/ui/componentes';
import { EtiquetaFase, Separador, Topo } from '@/ui/estudio';
import { corDaFase, espaco, raio, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';
import { voltarOuHoje } from '@/ui/voltar';

type Estado = { tipo: 'vazio' } | { tipo: 'analisando'; nome: string } | { tipo: 'erro'; mensagem: string } | { tipo: 'pronto'; nome: string; d: Diagnostico };

// Diagnóstico pelo WAV: para quando você não sabe em que etapa a track está.
// Tudo roda no aparelho, sem rede e sem IA: duração, volume, picos e curva de energia.
export default function DiagnosticoTela() {
  const c = useCores();
  const { track, fase: faseDaTrack } = useTrackAtiva();
  const [estado, setEstado] = useState<Estado>({ tipo: 'vazio' });

  async function analisar(audio: Audio | null) {
    if (!audio) return;
    setEstado({ tipo: 'analisando', nome: audio.nome });
    // Deixa a tela mostrar "analisando" antes do cálculo, que segura a thread por um instante.
    await new Promise((r) => setTimeout(r, 50));
    try {
      const d = diagnosticar(medir(medirBlocos(audio.bytes, lerCabecalho(audio.bytes))));
      setEstado({ tipo: 'pronto', nome: audio.nome, d });
    } catch (e) {
      setEstado({ tipo: 'erro', mensagem: e instanceof WavInvalido ? e.message : 'Não consegui ler esse arquivo. Tente exportar de novo em WAV.' });
    }
  }

  useSoltarArquivo((a) => void analisar(a));

  async function escolher() {
    try {
      await analisar(await escolherAudio());
    } catch {
      setEstado({ tipo: 'erro', mensagem: 'Não consegui abrir o arquivo.' });
    }
  }

  const pronto = estado.tipo === 'pronto' ? estado.d : null;
  const podeAvancar = pronto && track && faseDaTrack && FASES.indexOf(pronto.fase) > FASES.indexOf(faseDaTrack);

  const rodape = pronto ? (
    <>
      {podeAvancar ? (
        <Botao
          onPress={() => {
            avancarPara(track.id, pronto.fase);
            if (router.canDismiss()) router.dismissAll();
            router.replace('/hoje');
          }}
        >
          Levar {track.nome} para {FASE[pronto.fase].apelido}
        </Botao>
      ) : (
        <Botao onPress={() => router.push({ pathname: '/nova-track', params: { fase: pronto.fase } })}>Criar track nesta fase</Botao>
      )}
      <Botao tipo="texto" onPress={escolher}>
        Analisar outro arquivo
      </Botao>
    </>
  ) : (
    <Botao onPress={escolher} desabilitado={estado.tipo === 'analisando'}>
      {estado.tipo === 'analisando' ? 'Analisando…' : 'Escolher um WAV'}
    </Botao>
  );

  return (
    <Tela rodape={rodape}>
      <Topo titulo="Onde estou?" apoio="Diagnóstico pelo WAV" aoVoltar={voltarOuHoje} />

      {pronto ? (
        <>
          <Fala expressao="feliz" cor={corDaFase[pronto.fase]}>
            Pelo áudio, a track parece estar em <Destaque>{FASE[pronto.fase].apelido}</Destaque>.
          </Fala>
          <Cartao estilo={{ gap: 12, borderColor: corDaFase[pronto.fase] }}>
            <EtiquetaFase fase={pronto.fase} />
            {pronto.motivos.map((m) => (
              <Text key={m} style={[tipo.subtitulo, { color: c.texto }]}>
                {m}
              </Text>
            ))}
            <Text style={[tipo.nota, { color: c.apoio }]}>É uma estimativa pelo som. Automação e detalhes de mix não dá para medir: confira com o seu ouvido.</Text>
          </Cartao>
          <Grupo>
            {[
              ['Duração', `${Math.floor(pronto.metricas.duracaoSeg / 60)}:${String(Math.round(pronto.metricas.duracaoSeg % 60)).padStart(2, '0')}`],
              ['Volume aproximado', `${pronto.metricas.volumeLufs} LUFS`],
              ['Pico', `${pronto.metricas.picoDb} dBFS${pronto.metricas.pontosClipando ? ' · clipa' : ''}`],
              ['Variação de energia', `${pronto.metricas.variacaoDb} dB`],
              ['Viradas de energia', String(pronto.metricas.mudancas)],
            ].map(([k, v], i) => (
              <View key={k}>
                {i > 0 ? <Separador /> : null}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: espaco.l }}>
                  <Text style={[tipo.subtitulo, { color: c.apoio }]}>{k}</Text>
                  <Text style={[tipo.subtitulo, { color: c.texto, fontVariant: ['tabular-nums'] }]}>{v}</Text>
                </View>
              </View>
            ))}
          </Grupo>
          <Text style={[tipo.nota, { color: c.apoio, paddingHorizontal: 4 }]}>{estado.tipo === 'pronto' ? estado.nome : ''}</Text>
        </>
      ) : (
        <>
          <Fala expressao="calmo">
            Não sabe em que etapa está? <Destaque>Me mostre o WAV</Destaque> e eu estimo pela duração, pelo volume e pela energia.
          </Fala>
          <View
            style={{
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: c.linha,
              borderRadius: raio.cartao,
              paddingVertical: 40,
              paddingHorizontal: 20,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 34, color: c.apoio }}>〰</Text>
            <Text style={[tipo.corpoForte, { color: c.texto, textAlign: 'center' }]}>
              {estado.tipo === 'analisando' ? `Analisando ${estado.nome}…` : Platform.OS === 'web' ? 'Arraste o WAV para cá ou toque no botão' : 'Escolha um WAV no botão abaixo'}
            </Text>
            <Text style={[tipo.nota, { color: c.apoio, textAlign: 'center' }]}>Exporte do Ableton em WAV (16 ou 24 bits). O arquivo não sai do seu aparelho.</Text>
          </View>
          {estado.tipo === 'erro' ? <Text style={[tipo.subtitulo, { color: c.alerta }]}>{estado.mensagem}</Text> : null}
        </>
      )}
    </Tela>
  );
}
