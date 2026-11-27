import { Text, View } from 'react-native';

import { ESTILO, FASE } from '@/base';
import { ESCOLHA_AUTOMACAO } from '@/domain/trilha';
import { alternarEscolhida } from '@/features/track';
import { useTrackAtiva } from '@/features/useTrackAtiva';
import { Botao, Cartao, Destaque, Fala, Grupo, Tela } from '@/ui/componentes';
import { LinhaTarefa, Separador, Topo } from '@/ui/estudio';
import { corDaFase, espaco, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';
import { voltarOuHoje } from '@/ui/voltar';

const COR = corDaFase.automacao;

// Cardápio de automação (FR-026): por seção, a pessoa escolhe de 3 a 6 movimentos para a track.
export default function Automacao() {
  const c = useCores();
  const { track, tarefas } = useTrackAtiva();
  if (!track) return null;

  const cardapio = tarefas.filter((t) => t.tipo === 'cardapio');
  const escolhidas = cardapio.filter((t) => t.escolhida).length;
  const secoes = [...new Set(cardapio.map((t) => t.secao ?? ''))];
  const { min, max } = ESCOLHA_AUTOMACAO;
  const dica = FASE.automacao.dicas[track.estilo];

  return (
    <Tela
      rodape={
        <>
          <Text style={[tipo.nota, { color: escolhidas >= min && escolhidas <= max ? COR : c.apoio, textAlign: 'center', fontWeight: '600' }]}>
            {escolhidas} escolhidas · o ideal é de {min} a {max}
          </Text>
          <Botao onPress={voltarOuHoje} desabilitado={escolhidas < min}>
            {escolhidas < min ? `Escolha mais ${min - escolhidas}` : 'Pronto'}
          </Botao>
        </>
      }
    >
      <Topo titulo="Automações" apoio={`${track.nome} · ${ESTILO[track.estilo].nome}`} aoVoltar={voltarOuHoje} />
      <Fala cor={COR} valor={escolhidas / max}>
        Não precisa de tudo. <Destaque>Escolha de {min} a {max}</Destaque>: cada uma vira uma tarefa.
      </Fala>
      {dica ? (
        <Cartao estilo={{ gap: 4 }}>
          <Text style={[tipo.nota, { color: COR, fontWeight: '700' }]}>No {ESTILO[track.estilo].nome}</Text>
          <Text style={[tipo.subtitulo, { color: c.texto }]}>{dica}</Text>
        </Cartao>
      ) : null}
      {secoes.map((s) => {
        const itens = cardapio.filter((t) => (t.secao ?? '') === s);
        return (
          <View key={s} style={{ gap: espaco.s }}>
            <Text style={[tipo.nota, { color: c.apoio, fontWeight: '700', letterSpacing: 0.6, paddingHorizontal: 4 }]}>{s}</Text>
            <Grupo>
              {itens.map((t, i) => (
                <View key={t.id}>
                  {i > 0 ? <Separador /> : null}
                  <LinhaTarefa
                    texto={t.texto}
                    detalhe={`${t.parametro ?? ''}${t.feita ? ' · feita' : ''}`}
                    feita={t.escolhida}
                    marcador="escolha"
                    cor={COR}
                    aoMarcar={() => alternarEscolhida(t.id)}
                  />
                </View>
              ))}
            </Grupo>
          </View>
        );
      })}
      <Text style={[tipo.nota, { color: c.apoio, paddingHorizontal: 4 }]}>
        Antes de começar: dois returns (A delay, B reverb) e um Auto Filter nos grupos que vão se mexer. Desenhe com a tecla B, em curvas.
      </Text>
    </Tela>
  );
}
