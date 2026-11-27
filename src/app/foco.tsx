import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { FASE } from '@/base';
import { useAoVivo } from '@/data/aoVivo';
import { acabou, formatar, fracaoCumprida, LIMITE_ONDE_PAREI, restanteMs } from '@/domain/timer';
import { consultaBlocoAberto, descartarBloco, fecharBloco, pausarOuRetomar } from '@/features/bloco';
import { confirmar } from '@/platform/confirmar';
import { Barra, Botao, BotaoCircular, Cartao, Destaque, Fala, Rotulo, Tela } from '@/ui/componentes';
import { EtiquetaFase } from '@/ui/estudio';
import { corDaFase, raio, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

type Fase = 'rodando' | 'fechando' | 'onde-parei';

// Foco (R4) e fechamento (R5) numa tela só: o timer corre; quando acaba, ou quando a pessoa
// toca em "Terminei", a mesma tela pergunta como foi. O tempo vem de carimbos (ADR-008).
export default function Foco() {
  const c = useCores();
  const { data } = useAoVivo(consultaBlocoAberto());
  const b = data[0];
  const [agora, setAgora] = useState(() => Date.now());
  const [fase, setFase] = useState<Fase>('rodando');
  const [nota, setNota] = useState('');
  const avisou = useRef(false);

  const pausado = b?.pausadoEm != null;
  const terminouTempo = b ? acabou(b, agora) : false;
  const faseAtual: Fase = fase === 'rodando' && terminouTempo ? 'fechando' : fase;

  // Relógio da tela: só anda enquanto o bloco corre. Quem manda no tempo é o banco.
  useEffect(() => {
    if (!b || pausado || faseAtual !== 'rodando') return;
    const id = setInterval(() => setAgora(Date.now()), 250);
    return () => clearInterval(id);
  }, [b, pausado, faseAtual]);

  useEffect(() => {
    if (terminouTempo && !avisou.current) {
      avisou.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
  }, [terminouTempo]);

  // Sem bloco aberto (fechado ou descartado), volta para o Hoje.
  useEffect(() => {
    if (!b) router.replace('/hoje');
  }, [b]);

  if (!b) return null;

  // O que fazer neste bloco: o passo de volta (retomada), a versão feia ou a tarefa.
  const tarefa = b.texto ?? 'Sua tarefa';
  const passo = b.modo === 'retomada' && b.fase ? FASE[b.fase].retomada : b.modo === 'feia' ? (b.versaoFeia ?? tarefa) : tarefa;
  const cor = b.fase ? corDaFase[b.fase] : c.acao;

  // Seta de voltar (R4): no timer, volta ao Hoje com o bloco rodando; no fechamento, volta uma etapa.
  function voltar() {
    if (faseAtual === 'onde-parei') return setFase('fechando');
    if (faseAtual === 'fechando' && !terminouTempo) return setFase('rodando');
    if (router.canGoBack()) router.back();
    else router.replace('/hoje');
  }

  const topo = (
    <View style={{ flexDirection: 'row' }}>
      <BotaoCircular simbolo="chevron.left" rotulo={faseAtual === 'rodando' || terminouTempo ? 'Voltar ao Hoje' : 'Voltar'} onPress={voltar} />
    </View>
  );

  async function terminei() {
    await fecharBloco({ resposta: 'terminei' });
  }

  async function salvarOndeParei() {
    await fecharBloco({ resposta: 'continua', ondeParei: nota });
  }

  async function sair() {
    const sim = await confirmar({
      titulo: 'Sair sem contar?',
      mensagem: 'Esse bloco não vai contar. Use quando começou sem querer.',
      confirmar: 'Sair',
    });
    if (sim) await descartarBloco();
  }

  if (faseAtual === 'rodando') {
    const restante = restanteMs(b, agora);
    return (
      <Tela
        rodape={
          <>
            <Botao onPress={() => setFase('fechando')}>Terminei</Botao>
            <Botao tipo="texto" onPress={pausarOuRetomar}>
              {pausado ? 'Continuar' : 'Pausar'}
            </Botao>
          </>
        }
      >
        {topo}
        <View style={{ flex: 1, justifyContent: 'center', gap: 28 }}>
          <View style={{ alignItems: 'center', gap: 10 }}>
            {b.fase ? <EtiquetaFase fase={b.fase} texto={b.modo === 'feia' ? 'Versão feia' : b.modo === 'retomada' ? 'Volta de 10 min' : undefined} /> : null}
            <Text style={[tipo.titulo2, { color: c.texto, textAlign: 'center' }]}>{passo}</Text>
            {b.modo === 'feia' ? <Text style={[tipo.subtitulo, { color: c.apoio, textAlign: 'center' }]}>da tarefa: {tarefa}</Text> : null}
            {b.modo === 'completo' && b.prontoQuando ? (
              <Text style={[tipo.subtitulo, { color: c.apoio, textAlign: 'center' }]}>
                <Text style={{ color: cor, fontWeight: '700' }}>Pronto quando: </Text>
                {b.prontoQuando}
              </Text>
            ) : null}
          </View>
          {b.ondeParei ? (
            <Text style={[tipo.subtitulo, { color: c.apoio, textAlign: 'center' }]}>Você tinha parado em: {b.ondeParei}</Text>
          ) : null}
          <Text
            accessibilityRole="timer"
            accessibilityLabel={`${Math.ceil(restante / 60000)} minutos restantes${pausado ? ', pausado' : ''}`}
            style={{ fontSize: 76, lineHeight: 84, fontWeight: '700', fontVariant: ['tabular-nums'], color: pausado ? c.apoio : cor, textAlign: 'center' }}
          >
            {formatar(restante)}
          </Text>
          <Barra porcento={Math.round(fracaoCumprida(b, agora) * 100)} />
          <Text style={[tipo.nota, { color: c.apoio, textAlign: 'center' }]}>
            {pausado ? 'Pausado. O tempo espera por você.' : 'Pode ficar feio. Feito conta mais que perfeito.'}
          </Text>
        </View>
        <Botao tipo="texto" onPress={sair}>
          Sair sem contar
        </Botao>
      </Tela>
    );
  }

  if (faseAtual === 'fechando') {
    return (
      <Tela
        rodape={
          <>
            <Botao onPress={terminei}>{b.modo === 'retomada' ? 'Fiz o passo de volta' : 'Terminei a tarefa'}</Botao>
            <Botao tipo="texto" onPress={() => setFase('onde-parei')}>
              Ainda não terminei
            </Botao>
          </>
        }
      >
        {topo}
        <Fala expressao="feliz" cor={cor}>
          {terminouTempo ? 'Bloco feito.' : 'Boa.'} <Destaque>{b.modo === 'retomada' ? 'Você voltou.' : 'E a tarefa?'}</Destaque>
        </Fala>
        <Cartao estilo={{ gap: 6, paddingVertical: 18 }}>
          <Text style={[tipo.nota, { color: cor, fontWeight: '700' }]}>{b.modo === 'retomada' ? 'Passo de volta' : 'Sua tarefa'}</Text>
          <Text style={[tipo.corpoForte, { color: c.texto }]}>{passo}</Text>
          {b.modo === 'completo' && b.prontoQuando ? <Text style={[tipo.subtitulo, { color: c.apoio }]}>Pronto quando: {b.prontoQuando}</Text> : null}
        </Cartao>
        <Text style={[tipo.subtitulo, { color: c.apoio }]}>
          {b.modo === 'retomada' ? 'A tarefa continua no Hoje. Se quiser, anote onde parou.' : 'Se não terminou, tudo bem: você anota onde parou e volta daí.'}
        </Text>
      </Tela>
    );
  }

  return (
    <Tela rodape={<Botao onPress={salvarOndeParei}>Salvar e sair</Botao>}>
      {topo}
      <Fala expressao="calmo">
        <Destaque>Onde você parou?</Destaque> Uma linha basta.
      </Fala>
      <View style={{ gap: 12 }}>
        <Rotulo>Onde parei</Rotulo>
        <TextInput
          value={nota}
          onChangeText={setNota}
          autoFocus
          maxLength={LIMITE_ONDE_PAREI}
          returnKeyType="done"
          onSubmitEditing={salvarOndeParei}
          placeholder="Ex.: falta o fill antes do DROP 2"
          placeholderTextColor={c.apoio}
          accessibilityLabel="Onde você parou"
          style={[tipo.corpo, { height: 52, borderRadius: raio.celula, backgroundColor: c.celula, color: c.texto, paddingHorizontal: 16 }]}
        />
        <Text style={[tipo.nota, { color: c.apoio }]}>Pode deixar em branco. Na volta, o app mostra isso primeiro.</Text>
      </View>
    </Tela>
  );
}
