import { desc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';

import { db, schema } from '@/data/db';
import { porcentagem } from '@/domain/sumario';
import { apagarEstudo, consultaTopicos, lerDetalhes } from '@/features/comecar';
import { Barra, Botao, Cartao, Destaque, Fala, Tela } from '@/ui/componentes';
import { tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

// Hoje (versão provisória da semana 2): mostra o próximo tópico e a porcentagem.
// Na semana 3 ganha os estados do canvas; o Foco entra na semana 4.
export default function Hoje() {
  const c = useCores();
  const { data: estudos } = useLiveQuery(db.select().from(schema.estudo).orderBy(desc(schema.estudo.criadoEm)).limit(1));
  const estudo = estudos[0];
  const estudoId = estudo?.id ?? '';
  const { data: topicos } = useLiveQuery(consultaTopicos(estudoId), [estudoId]);

  const feitos = topicos.filter((t) => t.feitoEm !== null).length;
  const pct = porcentagem(feitos, topicos.length);
  const proximo = topicos.find((t) => t.feitoEm === null);
  const doGrupo = proximo ? topicos.filter((t) => t.grupoId === proximo.grupoId) : [];
  const posicao = proximo ? doGrupo.findIndex((t) => t.id === proximo.id) + 1 : 0;
  const oQueEstudar = lerDetalhes(proximo?.detalhes ?? null);

  function trocar() {
    Alert.alert('Trocar de estudo?', 'O estudo atual e o progresso dele serão apagados deste iPhone.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar e trocar',
        style: 'destructive',
        onPress: () => {
          if (estudoId) apagarEstudo(estudoId);
          router.replace('/inicio');
        },
      },
    ]);
  }

  return (
    <Tela rodape={<Botao tipo="texto" onPress={trocar}>Trocar de estudo</Botao>}>
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
            <Text style={[tipo.nota, { color: c.apoio, textAlign: 'center' }]}>O bloco de foco de 25 min chega na próxima versão.</Text>
          </Cartao>
        </>
      ) : (
        <Fala expressao="feliz">
          Você terminou <Destaque>{estudo?.nome ?? 'o estudo'}</Destaque>. Todos os tópicos estão feitos.
        </Fala>
      )}
    </Tela>
  );
}
