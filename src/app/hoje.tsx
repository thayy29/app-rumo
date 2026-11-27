import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useAoVivo } from '@/data/aoVivo';
import { porcentagem } from '@/domain/sumario';
import { consultaBlocoAberto, iniciarBloco, MINUTOS_BLOCO, MINUTOS_RETOMADA } from '@/features/bloco';
import { arquivarEstudo, consultaEstudoAtivo, consultaTopicos, lerDetalhes } from '@/features/comecar';
import { confirmar } from '@/platform/confirmar';
import { Barra, Botao, Cartao, Destaque, Fala, Tela } from '@/ui/componentes';
import { tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

// Hoje: o próximo passo, onde a pessoa parou e a porcentagem. Daqui começa o bloco (R4).
export default function Hoje() {
  const c = useCores();
  const { data: estudos } = useAoVivo(consultaEstudoAtivo());
  const estudo = estudos[0];
  const estudoId = estudo?.id ?? '';
  const { data: topicos } = useAoVivo(consultaTopicos(estudoId), [estudoId]);

  const feitos = topicos.filter((t) => t.feitoEm !== null).length;
  const pct = porcentagem(feitos, topicos.length);
  const proximo = topicos.find((t) => t.feitoEm === null);
  const doGrupo = proximo ? topicos.filter((t) => t.grupoId === proximo.grupoId) : [];
  const posicao = proximo ? doGrupo.findIndex((t) => t.id === proximo.id) + 1 : 0;
  const oQueEstudar = lerDetalhes(proximo?.detalhes ?? null);
  // Voltou do Foco pela seta com o bloco correndo: o Hoje oferece voltar a ele em vez de começar outro.
  const { data: abertos } = useAoVivo(consultaBlocoAberto());
  const emAndamento = abertos[0];

  async function comecar(minutos: number) {
    if (!proximo) return;
    await iniciarBloco(proximo.id, minutos);
    router.push('/foco');
  }

  async function trocar() {
    const sim = await confirmar({
      titulo: 'Trocar de estudo?',
      mensagem: 'O estudo atual fica guardado e sai do Hoje. Você começa outro do zero.',
      confirmar: 'Trocar',
    });
    if (!sim) return;
    if (estudoId) arquivarEstudo(estudoId);
    router.replace('/inicio');
  }

  return (
    <Tela
      rodape={
        emAndamento ? (
          <Botao onPress={() => router.push('/foco')}>Voltar ao bloco</Botao>
        ) : proximo ? (
          <>
            <Botao onPress={() => comecar(MINUTOS_BLOCO)}>Começar {MINUTOS_BLOCO} min</Botao>
            <Botao tipo="texto" onPress={() => comecar(MINUTOS_RETOMADA)}>
              Só {MINUTOS_RETOMADA} min · pode ficar feio
            </Botao>
          </>
        ) : undefined
      }
    >
      <View style={{ height: 8 }} />
      {proximo ? (
        <>
          <Fala>
            Hoje é <Destaque>só esse tópico</Destaque>:
          </Fala>
          <Cartao estilo={{ alignItems: 'center', gap: 14, paddingVertical: 24, paddingHorizontal: 22 }}>
            <Text style={[tipo.nota, { color: c.destaqueTinta, fontWeight: '600', textAlign: 'center' }]}>
              {proximo.grupo} · tópico {posicao} de {doGrupo.length}
            </Text>
            <Text style={[tipo.titulo1, { color: c.texto, textAlign: 'center' }]}>{proximo.texto}</Text>
            {proximo.ondeParei ? (
              <Text style={[tipo.subtitulo, { color: c.texto, textAlign: 'center' }]}>
                <Text style={{ color: c.apoio }}>Você parou em: </Text>
                {proximo.ondeParei}
              </Text>
            ) : null}
            {oQueEstudar.length > 0 ? (
              <View style={{ alignSelf: 'stretch', gap: 6 }} accessible accessibilityLabel={`O que estudar: ${oQueEstudar.join('. ')}`}>
                <Text style={[tipo.nota, { color: c.apoio, fontWeight: '600' }]}>O que estudar</Text>
                {oQueEstudar.map((d) => (
                  <View key={d} style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={[tipo.subtitulo, { color: c.destaqueTinta }]}>•</Text>
                    <Text style={[tipo.subtitulo, { color: c.texto, flex: 1 }]}>{d}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={{ alignSelf: 'stretch', gap: 8 }}>
              <Barra porcento={pct} />
              <Text style={[tipo.subtitulo, { color: c.apoio, textAlign: 'center' }]}>
                {pct}% de {estudo?.nome}
              </Text>
            </View>
          </Cartao>
        </>
      ) : (
        <Fala expressao="feliz">
          Você terminou <Destaque>{estudo?.nome ?? 'o estudo'}</Destaque>. Todos os tópicos estão feitos.
        </Fala>
      )}
      {emAndamento ? (
        <Text style={[tipo.subtitulo, { color: c.destaqueTinta, textAlign: 'center', fontWeight: '600' }]}>
          Bloco em andamento: {emAndamento.passo ?? 'seu passo'}
        </Text>
      ) : null}
      <View style={{ flex: 1 }} />
      {emAndamento ? null : (
        <Botao tipo="texto" onPress={trocar}>
          Trocar de estudo
        </Botao>
      )}
      {process.env.EXPO_PUBLIC_VERSAO ? (
        <Text style={[tipo.nota, { color: c.apoio, textAlign: 'center', opacity: 0.6 }]}>versão {process.env.EXPO_PUBLIC_VERSAO}</Text>
      ) : null}
    </Tela>
  );
}
