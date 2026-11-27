import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { FASE, FASES, SECAO, SECOES } from '@/base';
import { Botao, Cartao, Grupo, Tela } from '@/ui/componentes';
import { Chips, Separador, Topo } from '@/ui/estudio';
import { corDaFase, espaco, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';
import { voltarOuHoje } from '@/ui/voltar';

type Aba = 'etapas' | 'secoes';

// Guia: o que é cada etapa da trilha e cada seção do arranjo, para quando você não sabe onde está.
export default function Guia() {
  const c = useCores();
  const [aba, setAba] = useState<Aba>('etapas');
  const [aberta, setAberta] = useState<string | null>(null);

  return (
    <Tela rodape={<Botao onPress={() => router.push('/diagnostico')}>Descobrir minha etapa pelo WAV</Botao>}>
      <Topo titulo="Guia" apoio="Onde estou e o que vem depois" aoVoltar={voltarOuHoje} />
      <Chips
        rotulo="Assunto"
        opcoes={[
          { id: 'etapas', nome: 'Etapas da trilha' },
          { id: 'secoes', nome: 'Seções da track' },
        ]}
        valor={aba}
        aoEscolher={(a) => {
          setAba(a);
          setAberta(null);
        }}
      />

      {aba === 'etapas' ? (
        <Grupo>
          {FASES.map((f, i) => {
            const info = FASE[f];
            const expandida = aberta === f;
            return (
              <View key={f}>
                {i > 0 ? <Separador /> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: expandida }}
                  onPress={() => setAberta(expandida ? null : f)}
                  style={{ flexDirection: 'row', gap: espaco.m, paddingVertical: 14, paddingHorizontal: espaco.l }}
                >
                  <View style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: corDaFase[f], alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[tipo.nota, { color: c.acaoTexto, fontWeight: '800' }]}>{info.numero}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[tipo.corpoForte, { color: c.texto }]}>
                      {info.apelido} <Text style={[tipo.nota, { color: c.apoio }]}>{info.nome}</Text>
                    </Text>
                    <Text style={[tipo.nota, { color: c.apoio }]}>{info.resumo}</Text>
                    {expandida ? <Text style={[tipo.subtitulo, { color: c.texto, marginTop: 4 }]}>{info.explicacao}</Text> : null}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </Grupo>
      ) : (
        <>
          <Cartao estilo={{ gap: 4 }}>
            <Text style={[tipo.subtitulo, { color: c.texto }]}>
              Músicas de pista andam em blocos de 8, 16 e 32 compassos. Cada seção tem um papel na energia da pista.
            </Text>
          </Cartao>
          <Grupo>
            {SECOES.map((s, i) => (
              <View key={s}>
                {i > 0 ? <Separador /> : null}
                <View style={{ paddingVertical: 14, paddingHorizontal: espaco.l, gap: 4 }}>
                  <Text style={[tipo.corpoForte, { color: corDaFase.arranjo }]}>{s}</Text>
                  <Text style={[tipo.subtitulo, { color: c.texto }]}>{SECAO[s].papel}</Text>
                  <Text style={[tipo.nota, { color: c.apoio }]}>Como reconhecer: {SECAO[s].comoReconhecer}</Text>
                </View>
              </View>
            ))}
          </Grupo>
        </>
      )}
    </Tela>
  );
}
