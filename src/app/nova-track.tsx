import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { ESTILO, ESTILOS, FASE, FASES, type Estilo, type Fase } from '@/base';
import { useAoVivo } from '@/data/aoVivo';
import { consultaFasesComModelo, criarTrack } from '@/features/track';
import { Botao, BotaoCircular, Destaque, Fala, Rotulo, Tela } from '@/ui/componentes';
import { Chips, Passos } from '@/ui/estudio';
import { corDaFase, raio, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

// Nova track (FR-022 e FR-024) numa tela só: nome, estilo, BPM, destino e onde ela está.
export default function NovaTrack() {
  const c = useCores();
  const [nome, setNome] = useState('');
  const [estilo, setEstilo] = useState<Estilo>('deep');
  const [bpm, setBpm] = useState(ESTILO.deep.bpm.padrao);
  const [destino, setDestino] = useState<'pista' | 'streaming'>('pista');
  const [fase, setFase] = useState<Fase>('ideia');
  const { data: comModelo } = useAoVivo(consultaFasesComModelo());

  function trocarEstilo(e: Estilo) {
    setEstilo(e);
    setBpm(ESTILO[e].bpm.padrao);
  }

  function criar() {
    criarTrack({ nome, estilo, bpm, destino, fase });
    // Volta à raiz da pilha: o Hoje da track nova não deve ter "voltar" para o formulário.
    if (router.canDismiss()) router.dismissAll();
    router.replace('/hoje');
  }

  const faixa = ESTILO[estilo].bpm;

  return (
    <Tela rodape={<Botao onPress={criar}>Criar a trilha</Botao>}>
      {router.canGoBack() ? (
        <View style={{ flexDirection: 'row' }}>
          <BotaoCircular simbolo="chevron.left" rotulo="Voltar" onPress={() => router.back()} />
        </View>
      ) : null}
      <Fala>
        Qual track <Destaque>vamos terminar?</Destaque>
      </Fala>

      <View style={{ gap: 12 }}>
        <Rotulo>Nome</Rotulo>
        <TextInput
          value={nome}
          onChangeText={setNome}
          maxLength={60}
          returnKeyType="done"
          placeholder="Ex.: Sunset Groove"
          placeholderTextColor={c.apoio}
          accessibilityLabel="Nome da track"
          style={[tipo.corpo, { height: 52, borderRadius: raio.celula, backgroundColor: c.celula, color: c.texto, paddingHorizontal: 16, borderWidth: 1, borderColor: c.separador }]}
        />
      </View>

      <View style={{ gap: 12 }}>
        <Rotulo>Estilo</Rotulo>
        <Chips rotulo="Estilo" opcoes={ESTILOS.map((e) => ({ id: e, nome: ESTILO[e].nome }))} valor={estilo} aoEscolher={trocarEstilo} />
        <Text style={[tipo.nota, { color: c.apoio, paddingHorizontal: 4 }]}>{ESTILO[estilo].groove}</Text>
      </View>

      <View style={{ gap: 12 }}>
        <Rotulo>BPM</Rotulo>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Passos rotulo="BPM" valor={bpm} aoMudar={setBpm} min={90} max={160} />
          <Text style={[tipo.nota, { color: c.apoio }]}>
            {ESTILO[estilo].nome} costuma ficar entre {faixa.min} e {faixa.max}
          </Text>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Rotulo>Para onde</Rotulo>
        <Chips
          rotulo="Destino"
          opcoes={[
            { id: 'pista', nome: 'Pista (DJ)' },
            { id: 'streaming', nome: 'Streaming' },
          ]}
          valor={destino}
          aoEscolher={setDestino}
        />
      </View>

      <View style={{ gap: 12 }}>
        <Rotulo>Onde ela está</Rotulo>
        <Chips rotulo="Fase atual" opcoes={FASES.map((f) => ({ id: f, nome: FASE[f].nome, cor: corDaFase[f] }))} valor={fase} aoEscolher={setFase} />
        <Text style={[tipo.nota, { color: c.apoio, paddingHorizontal: 4 }]}>
          {fase === 'ideia' ? 'Começando do zero.' : `As fases antes de ${FASE[fase].nome} entram como feitas.`}
        </Text>
        {comModelo.length > 0 ? (
          <Text style={[tipo.nota, { color: c.acao, paddingHorizontal: 4 }]}>
            Usando seus modelos em: {FASES.filter((f) => comModelo.some((m) => m.fase === f)).map((f) => FASE[f].apelido).join(', ')}
          </Text>
        ) : null}
      </View>
    </Tela>
  );
}
