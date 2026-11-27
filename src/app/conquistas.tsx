import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { ESTILO } from '@/base';
import { NIVEIS, nivelPara, porMes, subiuDeNivel } from '@/domain/nivel';
import { useNivel } from '@/features/useNivel';
import { Barra, Cartao, Destaque, Grupo, Tela } from '@/ui/componentes';
import { Separador, Topo } from '@/ui/estudio';
import { Knob } from '@/ui/Knob';
import { espaco, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';
import { voltarOuHoje } from '@/ui/voltar';

// Conquistas: tracks terminadas, o gráfico por mês e os níveis que vestem o Knob.
// Aberta logo depois de concluir uma track, comemora (e mostra o upgrade, se subiu).
export default function Conquistas() {
  const c = useCores();
  const { antes, depois } = useLocalSearchParams<{ antes?: string; depois?: string }>();
  const { terminadas, nivel, proximo } = useNivel();
  const [agora] = useState(() => Date.now());
  const total = terminadas.length;
  const meses = porMes(
    terminadas.map((t) => t.terminadaEm ?? 0),
    agora,
  );
  const maior = Math.max(1, ...meses.map((m) => m.total));
  const acabou = depois !== undefined && Number(depois) > Number(antes);
  const subiu = acabou && subiuDeNivel(Number(antes), Number(depois));
  const faltam = proximo ? proximo.minimo - total : 0;
  const base = nivelPara(total).minimo;

  return (
    <Tela>
      <Topo titulo="Conquistas" apoio={total === 1 ? '1 track terminada' : `${total} tracks terminadas`} aoVoltar={voltarOuHoje} />

      <Cartao estilo={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}>
        <Knob tamanho={150} expressao={acabou ? 'feliz' : 'neutro'} valor={1} upgrade={nivel.upgrade} />
        {acabou ? (
          <Text style={[tipo.titulo2, { color: c.texto, textAlign: 'center' }]}>
            {subiu ? (
              <>
                Subiu de nível! <Destaque>{nivel.ganho}</Destaque>
              </>
            ) : (
              <>
                Track terminada. <Destaque>Mais uma no mundo.</Destaque>
              </>
            )}
          </Text>
        ) : null}
        <Text style={[tipo.corpoForte, { color: c.acao }]}>{nivel.nome}</Text>
        {proximo ? (
          <View style={{ alignSelf: 'stretch', gap: 6 }}>
            <Barra porcento={Math.round(((total - base) / (proximo.minimo - base)) * 100)} />
            <Text style={[tipo.nota, { color: c.apoio, textAlign: 'center' }]}>
              {faltam === 1 ? 'Falta 1 track' : `Faltam ${faltam} tracks`} para {proximo.nome}: {proximo.ganho.toLowerCase()}
            </Text>
          </View>
        ) : (
          <Text style={[tipo.nota, { color: c.apoio }]}>Nível máximo. O Knob está completo.</Text>
        )}
      </Cartao>

      <Text style={[tipo.nota, { color: c.apoio, fontWeight: '700', letterSpacing: 0.6, paddingHorizontal: 4 }]}>TRACKS POR MÊS</Text>
      <Cartao>
        <View
          accessible
          accessibilityLabel={`Tracks terminadas por mês: ${meses.map((m) => `${m.rotulo} ${m.total}`).join(', ')}`}
          style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 10 }}
        >
          {meses.map((m) => (
            <View key={m.rotulo} style={{ flex: 1, alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <Text style={[tipo.nota, { color: m.total ? c.texto : c.apoio, fontVariant: ['tabular-nums'] }]}>{m.total}</Text>
              <View style={{ alignSelf: 'stretch', height: `${Math.max(4, (m.total / maior) * 70)}%`, borderRadius: 5, backgroundColor: m.total ? c.acao : c.celula2 }} />
              <Text style={[tipo.nota, { color: c.apoio }]}>{m.rotulo}</Text>
            </View>
          ))}
        </View>
      </Cartao>

      <Text style={[tipo.nota, { color: c.apoio, fontWeight: '700', letterSpacing: 0.6, paddingHorizontal: 4 }]}>NÍVEIS DO KNOB</Text>
      <Grupo>
        {NIVEIS.map((n, i) => {
          const ganho = total >= n.minimo;
          return (
            <View key={n.indice}>
              {i > 0 ? <Separador /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaco.m, paddingVertical: 10, paddingHorizontal: espaco.l, opacity: ganho ? 1 : 0.5 }}>
                <Knob tamanho={44} valor={ganho ? 1 : 0} upgrade={n.upgrade} expressao={ganho ? 'feliz' : 'calmo'} />
                <View style={{ flex: 1 }}>
                  <Text style={[tipo.corpoForte, { color: c.texto }]}>{n.nome}</Text>
                  <Text style={[tipo.nota, { color: c.apoio }]}>
                    {n.minimo === 0 ? 'Começo' : n.minimo === 1 ? '1 track' : `${n.minimo} tracks`} · {n.ganho}
                  </Text>
                </View>
                <Text style={[tipo.nota, { color: ganho ? c.acao : c.apoio, fontWeight: '700' }]}>{ganho ? '✓' : '🔒'}</Text>
              </View>
            </View>
          );
        })}
      </Grupo>

      {terminadas.length > 0 ? (
        <>
          <Text style={[tipo.nota, { color: c.apoio, fontWeight: '700', letterSpacing: 0.6, paddingHorizontal: 4 }]}>TERMINADAS</Text>
          <Grupo>
            {terminadas.map((t, i) => (
              <View key={t.id}>
                {i > 0 ? <Separador /> : null}
                <View style={{ paddingVertical: 12, paddingHorizontal: espaco.l }}>
                  <Text style={[tipo.corpoForte, { color: c.texto }]}>{t.nome}</Text>
                  <Text style={[tipo.nota, { color: c.apoio }]}>
                    {ESTILO[t.estilo].nome} · {t.terminadaEm ? new Date(t.terminadaEm).toLocaleDateString('pt-BR') : ''}
                  </Text>
                </View>
              </View>
            ))}
          </Grupo>
        </>
      ) : null}
    </Tela>
  );
}
