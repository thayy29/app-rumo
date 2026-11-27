import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { FASE, FASES, type Fase } from '@/base';

import { Simbolo } from './Simbolo';
import { corDaFase, espaco, raio, tipo } from './tokens';
import { useCores } from './useCores';

// Componentes do estúdio (ADR-020): fases com cor, seletores e linhas de tarefa.

// As 8 fases como as faixas de uma DAW: feitas cheias, a atual acesa, as próximas apagadas.
export function TiraDeFases({ atual, terminada = false }: { atual: Fase; terminada?: boolean }) {
  const c = useCores();
  const i = FASES.indexOf(atual);
  return (
    <View accessible accessibilityLabel={terminada ? 'Track terminada' : `Fase ${i + 1} de 8: ${FASE[atual].nome}`} style={{ flexDirection: 'row', gap: 4 }}>
      {FASES.map((f, j) => {
        const feita = terminada || j < i;
        const agora = !terminada && j === i;
        return (
          <View
            key={f}
            style={{
              flex: agora ? 2.2 : 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: feita || agora ? corDaFase[f] : c.celula2,
              opacity: feita ? 0.55 : 1,
            }}
          />
        );
      })}
    </View>
  );
}

export function EtiquetaFase({ fase, texto }: { fase: Fase; texto?: string }) {
  const cor = corDaFase[fase];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: cor }} />
      <Text style={[tipo.nota, { color: cor, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }]}>
        {texto ?? `${FASE[fase].numero} · ${FASE[fase].nome}`}
      </Text>
    </View>
  );
}

// Seletor em pílulas, como os botões de modo de um equipamento.
export function Chips<T extends string>({
  opcoes,
  valor,
  aoEscolher,
  rotulo,
}: {
  opcoes: readonly { id: T; nome: string; cor?: string }[];
  valor: T;
  aoEscolher: (id: T) => void;
  rotulo: string;
}) {
  const c = useCores();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={rotulo} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espaco.s }}>
      {opcoes.map((o) => {
        const ativo = o.id === valor;
        const cor = o.cor ?? c.acao;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: ativo }}
            onPress={() => aoEscolher(o.id)}
            style={({ pressed }) => ({
              minHeight: 44,
              paddingHorizontal: 16,
              borderRadius: raio.botao,
              justifyContent: 'center',
              backgroundColor: ativo ? cor : c.celula,
              borderWidth: 1,
              borderColor: ativo ? cor : c.linha,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={[tipo.subtitulo, { color: ativo ? c.acaoTexto : c.texto, fontWeight: '600' }]}>{o.nome}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Número com - e +, para o BPM.
export function Passos({ valor, aoMudar, min, max, rotulo, sufixo }: { valor: number; aoMudar: (v: number) => void; min: number; max: number; rotulo: string; sufixo?: string }) {
  const c = useCores();
  const botao = (sinal: -1 | 1) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sinal < 0 ? `Diminuir ${rotulo}` : `Aumentar ${rotulo}`}
      onPress={() => aoMudar(Math.max(min, Math.min(max, valor + sinal)))}
      style={({ pressed }) => ({ width: 52, height: 52, borderRadius: 26, backgroundColor: c.celula2, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
    >
      <Text style={{ color: c.texto, fontSize: 26, lineHeight: 30, fontWeight: '500' }}>{sinal < 0 ? '−' : '+'}</Text>
    </Pressable>
  );
  return (
    <View accessible accessibilityLabel={`${rotulo}: ${valor}`} style={{ flexDirection: 'row', alignItems: 'center', gap: espaco.l }}>
      {botao(-1)}
      <Text style={{ color: c.texto, fontSize: 34, fontWeight: '700', fontVariant: ['tabular-nums'], minWidth: 90, textAlign: 'center' }}>
        {valor}
        {sufixo ? <Text style={[tipo.subtitulo, { color: c.apoio }]}> {sufixo}</Text> : null}
      </Text>
      {botao(1)}
    </View>
  );
}

// Uma tarefa na trilha: o círculo marca feita; o resto mostra o que é.
export function LinhaTarefa({
  texto,
  detalhe,
  feita,
  cor,
  aoMarcar,
  marcador = 'check',
  direita,
}: {
  texto: string;
  detalhe?: string | null;
  feita: boolean;
  cor: string;
  aoMarcar: () => void;
  marcador?: 'check' | 'escolha';
  direita?: ReactNode;
}) {
  const c = useCores();
  const rotulo = marcador === 'escolha' ? (feita ? 'Tirar da track' : 'Escolher para a track') : feita ? 'Desmarcar' : 'Marcar como feita';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: espaco.m, paddingVertical: 12, paddingHorizontal: espaco.l }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: feita }}
        accessibilityLabel={`${rotulo}: ${texto}`}
        hitSlop={10}
        onPress={aoMarcar}
        style={{
          width: 26,
          height: 26,
          borderRadius: marcador === 'escolha' ? 7 : 13,
          borderWidth: 2,
          borderColor: feita ? cor : c.linha,
          backgroundColor: feita ? cor : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}
      >
        {feita ? <Simbolo name="checkmark" size={13} weight="bold" tintColor={c.acaoTexto} /> : null}
      </Pressable>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[tipo.subtitulo, { color: feita && marcador === 'check' ? c.apoio : c.texto, textDecorationLine: feita && marcador === 'check' ? 'line-through' : 'none' }]}>{texto}</Text>
        {detalhe ? <Text style={[tipo.nota, { color: c.apoio }]}>{detalhe}</Text> : null}
      </View>
      {direita}
    </View>
  );
}

export function Separador() {
  const c = useCores();
  return <View style={{ height: 1, backgroundColor: c.separador, marginLeft: 54 }} />;
}

// Topo das telas secundárias: voltar, título e uma linha de apoio.
export function Topo({ titulo, apoio, aoVoltar }: { titulo: string; apoio?: string; aoVoltar: () => void }) {
  const c = useCores();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaco.m }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={6}
        onPress={aoVoltar}
        style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: c.celula, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
      >
        <Simbolo name="chevron.left" size={17} weight="semibold" tintColor={c.texto} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text accessibilityRole="header" style={[tipo.titulo2, { color: c.texto }]} numberOfLines={1}>
          {titulo}
        </Text>
        {apoio ? (
          <Text style={[tipo.nota, { color: c.apoio }]} numberOfLines={1}>
            {apoio}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
