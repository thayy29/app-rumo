import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ESTILO, FASE } from '@/base';
import { useAoVivo } from '@/data/aoVivo';
import { precisaRetomada } from '@/domain/trilha';
import { consultaBlocoAberto, iniciarBloco, MINUTOS } from '@/features/bloco';
import { consultaUltimoBloco, existeTrack } from '@/features/track';
import { useTrackAtiva } from '@/features/useTrackAtiva';
import type { ModoBloco } from '@/data/schema';
import { Botao, BotaoCircular, Cartao, Destaque, Fala, Tela } from '@/ui/componentes';
import { EtiquetaFase, TiraDeFases } from '@/ui/estudio';
import { Simbolo, type NomeSimbolo } from '@/ui/Simbolo';
import { corDaFase, espaco, raio, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

// Hoje: a track aberta, a fase em que ela está e só a próxima tarefa (FR-006).
export default function Hoje() {
  const c = useCores();
  const { track, fase, proxima, progresso, faltaEscolherAutomacao } = useTrackAtiva();
  const { data: abertos } = useAoVivo(consultaBlocoAberto());
  const emAndamento = abertos[0];
  const trackId = track?.id ?? '';
  const { data: ultimo } = useAoVivo(consultaUltimoBloco(trackId), [trackId]);
  const [pularRetomada, setPularRetomada] = useState(false);
  // Hora da abertura da tela: basta para decidir a retomada (3 dias ou mais sem bloco).
  const [abertoEm] = useState(() => Date.now());

  // A consulta ao vivo pode chegar vazia no primeiro desenho: só manda ao Início se não há track mesmo.
  if (!track) return existeTrack() ? null : <Redirect href="/inicio" />;

  const cor = fase ? corDaFase[fase] : c.acao;
  const retomada = !pularRetomada && !!proxima && precisaRetomada(ultimo[0]?.em ?? null, abertoEm);
  const escolher = fase === 'automacao' && !proxima && faltaEscolherAutomacao;
  const dica = fase ? FASE[fase].dicas[track.estilo] : undefined;

  async function comecar(modo: ModoBloco) {
    if (!proxima || !track) return;
    await iniciarBloco({ trackId: track.id, tarefaId: proxima.id, modo });
    router.push('/foco');
  }

  const cabecalho = (
    <View style={{ gap: espaco.m }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaco.m }}>
        <View style={{ flex: 1 }}>
          <Text style={[tipo.titulo2, { color: c.texto }]} numberOfLines={1}>
            {track.nome}
          </Text>
          <Text style={[tipo.nota, { color: c.apoio }]}>
            {ESTILO[track.estilo].nome} · {track.bpm} BPM · {track.destino === 'pista' ? 'pista' : 'streaming'}
          </Text>
        </View>
        <BotaoCircular simbolo="music.note.list" rotulo="Minhas tracks" onPress={() => router.push('/tracks')} />
      </View>
      <TiraDeFases atual={fase ?? 'export'} terminada={fase === null} />
    </View>
  );

  const atalhos = (
    <View style={{ flexDirection: 'row', gap: espaco.s }}>
      <Atalho simbolo="list.bullet" texto="Trilha" onPress={() => router.push('/trilha')} />
      <Atalho simbolo="map" texto="Mapa de arranjo" onPress={() => router.push('/mapa')} />
      {fase === 'automacao' || fase === 'vida' ? <Atalho simbolo="slider.horizontal.3" texto="Automações" onPress={() => router.push('/automacao')} /> : null}
    </View>
  );

  const versao = process.env.EXPO_PUBLIC_VERSAO ? (
    <Text style={[tipo.nota, { color: c.apoio, textAlign: 'center', opacity: 0.6 }]}>versão {process.env.EXPO_PUBLIC_VERSAO}</Text>
  ) : null;

  // Track terminada: o WAV existe.
  if (fase === null) {
    return (
      <Tela rodape={<Botao onPress={() => router.push('/nova-track')}>Começar outra track</Botao>}>
        {cabecalho}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <Fala expressao="feliz" tamanho={72} valor={1}>
            <Destaque>Track terminada.</Destaque> O WAV existe, e isso é o que conta.
          </Fala>
        </View>
        {atalhos}
        {versao}
      </Tela>
    );
  }

  const rodape = emAndamento ? (
    <Botao onPress={() => router.push('/foco')}>Voltar ao bloco</Botao>
  ) : escolher ? (
    <Botao onPress={() => router.push('/automacao')}>Escolher automações</Botao>
  ) : retomada ? (
    <>
      <Botao onPress={() => comecar('retomada')}>Voltar com {MINUTOS.retomada} min</Botao>
      <Botao tipo="texto" onPress={() => setPularRetomada(true)}>
        Prefiro a tarefa de hoje
      </Botao>
    </>
  ) : proxima ? (
    <>
      <Botao onPress={() => comecar('completo')}>Começar {MINUTOS.completo} min</Botao>
      <Botao tipo="texto" onPress={() => comecar('feia')} rotuloAcessivel={`Versão feia em ${MINUTOS.feia} minutos: ${proxima.versaoFeia ?? ''}`}>
        Versão feia · {MINUTOS.feia} min
      </Botao>
    </>
  ) : undefined;

  return (
    <Tela rodape={rodape}>
      {cabecalho}
      {escolher ? (
        <Fala valor={progresso} cor={cor}>
          Hora do movimento. Escolha <Destaque>de 3 a 6 automações</Destaque> para esta track.
        </Fala>
      ) : retomada ? (
        <Fala expressao="calmo" valor={progresso} cor={cor}>
          Bom te ver. <Destaque>Só 10 minutos</Destaque>, sem exigir qualidade:
        </Fala>
      ) : (
        <Fala valor={progresso} cor={cor}>
          Hoje é <Destaque>só isso</Destaque>:
        </Fala>
      )}

      {proxima ? (
        <Cartao estilo={{ gap: 14, paddingVertical: 22, paddingHorizontal: 20, borderColor: cor }}>
          <EtiquetaFase fase={fase} />
          {proxima.grupo || proxima.secao ? (
            <Text style={[tipo.nota, { color: c.apoio, fontWeight: '600' }]}>{[proxima.grupo, proxima.secao].filter(Boolean).join(' · ')}</Text>
          ) : null}
          <Text style={[tipo.titulo1, { color: c.texto }]}>{retomada ? FASE[fase].retomada : proxima.texto}</Text>
          {retomada ? (
            <Text style={[tipo.subtitulo, { color: c.apoio }]}>Depois disso: {proxima.texto}</Text>
          ) : proxima.prontoQuando ? (
            <Linha rotulo="Pronto quando" texto={proxima.prontoQuando} cor={cor} />
          ) : null}
          {proxima.parametro ? <Linha rotulo="Parâmetro" texto={proxima.parametro} cor={cor} /> : null}
          {proxima.ondeParei ? <Linha rotulo="Você parou em" texto={proxima.ondeParei} cor={cor} /> : null}
          {!retomada && proxima.versaoFeia ? <Linha rotulo="Versão feia" texto={proxima.versaoFeia} cor={c.apoio} /> : null}
        </Cartao>
      ) : null}

      {dica && !retomada ? (
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 4 }}>
          <Text style={[tipo.nota, { color: cor, fontWeight: '700' }]}>{ESTILO[track.estilo].nome}</Text>
          <Text style={[tipo.nota, { color: c.apoio, flex: 1 }]}>{dica}</Text>
        </View>
      ) : null}

      {emAndamento ? (
        <Text style={[tipo.subtitulo, { color: c.destaqueTinta, textAlign: 'center', fontWeight: '600' }]}>Bloco em andamento: {emAndamento.texto ?? 'sua tarefa'}</Text>
      ) : null}
      <View style={{ flex: 1 }} />
      {atalhos}
      {versao}
    </Tela>
  );
}

function Linha({ rotulo, texto, cor }: { rotulo: string; texto: string; cor: string }) {
  const c = useCores();
  return (
    <View style={{ gap: 2 }}>
      <Text style={[tipo.nota, { color: cor, fontWeight: '700' }]}>{rotulo}</Text>
      <Text style={[tipo.subtitulo, { color: c.texto }]}>{texto}</Text>
    </View>
  );
}

function Atalho({ simbolo, texto, onPress }: { simbolo: NomeSimbolo; texto: string; onPress: () => void }) {
  const c = useCores();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 64,
        borderRadius: raio.celula,
        backgroundColor: c.celula,
        borderWidth: 1,
        borderColor: c.separador,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 8,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Simbolo name={simbolo} size={18} tintColor={c.texto} />
      <Text style={[tipo.nota, { color: c.texto, fontWeight: '600', textAlign: 'center' }]}>{texto}</Text>
    </Pressable>
  );
}
