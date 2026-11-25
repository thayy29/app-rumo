import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';

import { analisarEntrada } from '@/domain/entrada';
import { importarSumario, resumo, type SumarioImportado } from '@/domain/sumario';
import { importarPorLink, salvarEstudo } from '@/features/comecar';
import { useRascunho } from '@/state/rascunho';
import { Botao, Cartao, Destaque, Etapas, Fala, Icone, Rotulo, Tela } from '@/ui/componentes';
import { raio, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

// Começar 2 (FR-002 + ADR-014): um campo só. A pessoa cola o link do curso ou a lista de aulas,
// do jeito que conseguir; o app descobre o que é e organiza.
export default function ComecarSumario() {
  const c = useCores();
  const r = useRascunho();
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState('');
  const pedido = useRef('');

  const entrada = useMemo(() => analisarEntrada(r.sumario), [r.sumario]);
  const doTexto = useMemo(
    () => (entrada.tipo === 'texto' ? importarSumario(r.sumario, r.nome || 'Meu estudo') : null),
    [entrada.tipo, r.sumario, r.nome],
  );

  const url = entrada.tipo === 'link' ? entrada.url : '';
  const doLink = url && r.linkLido === url ? r.doLink : null;
  const previa: SumarioImportado | null = entrada.tipo === 'link' ? doLink : doTexto && doTexto.totalTopicos > 0 ? doTexto : null;

  // Link colado: lê sozinho depois de uma pausa curta, sem botão.
  useEffect(() => {
    if (!url || r.linkLido === url) return;
    const espera = setTimeout(async () => {
      pedido.current = url;
      setLendo(true);
      setErro('');
      const resultado = await importarPorLink(url, r.nome || 'Meu estudo');
      if (pedido.current !== url) return; // a pessoa já colou outra coisa
      setLendo(false);
      if (resultado.ok) r.definir({ doLink: resultado.sumario, linkLido: url });
      else setErro(resultado.mensagem);
    }, 500);
    return () => clearTimeout(espera);
  }, [url, r]);

  function aoMudar(texto: string) {
    setErro('');
    if (!texto.trim()) setLendo(false);
    r.definir({ sumario: texto });
  }

  function continuar() {
    if (!previa) return;
    const { estudoId } = salvarEstudo({ tipo: r.tipo, nome: r.nome.trim(), importado: previa, substituirId: r.estudoId });
    r.definir({ estudoId });
    router.push('/comecar/ate-onde');
  }

  return (
    <Tela rodape={<Botao desabilitado={!previa || lendo} onPress={continuar}>Continuar</Botao>}>
      <Etapas atual={2} total={3} />
      <Fala>{falaDoMascote(entrada.tipo, lendo, !!previa, !!erro)}</Fala>

      <View style={{ gap: 12 }}>
        <Rotulo>Link do curso ou lista de aulas</Rotulo>
        <TextInput
          value={r.sumario}
          onChangeText={aoMudar}
          multiline
          autoCorrect={false}
          placeholder={'Cole o link da página do curso\nou a lista de aulas, do jeito que vier.'}
          placeholderTextColor={c.apoio}
          accessibilityLabel="Link do curso ou lista de aulas"
          style={[
            tipo.corpo,
            { height: entrada.tipo === 'link' ? 96 : 200, borderRadius: raio.celula, backgroundColor: c.celula, color: c.texto, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, textAlignVertical: 'top' },
          ]}
        />
      </View>

      {entrada.tipo === 'link' && lendo ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }} accessibilityLiveRegion="polite">
          <ActivityIndicator color={c.acao} />
          <Text style={[tipo.subtitulo, { color: c.apoio }]}>Lendo {entrada.site}…</Text>
        </View>
      ) : null}

      {erro ? (
        <Text style={[tipo.subtitulo, { color: c.alerta }]} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : null}

      {previa ? (
        <Cartao estilo={{ gap: 12, paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icone simbolo={entrada.tipo === 'link' ? 'link' : 'list.bullet'} />
            <View style={{ flex: 1 }}>
              <Text style={[tipo.corpoForte, { color: c.texto }]}>{resumo(previa)}</Text>
              <Text style={[tipo.subtitulo, { color: c.apoio }]}>
                {entrada.tipo === 'link' ? `Organizado a partir de ${entrada.site}` : legendaDoTexto(previa)}
              </Text>
            </View>
          </View>
          <Previa sumario={previa} />
        </Cartao>
      ) : null}
    </Tela>
  );
}

// Mostra o começo da organização, para a pessoa conferir antes de seguir.
function Previa({ sumario }: { sumario: SumarioImportado }) {
  const c = useCores();
  const grupos = sumario.grupos.slice(0, 2);
  const mostrados = grupos.reduce((n, g) => n + Math.min(g.topicos.length, 3), 0);
  const resto = sumario.totalTopicos - mostrados;
  return (
    <View style={{ gap: 10, borderTopWidth: 0.5, borderTopColor: c.separador, paddingTop: 12 }}>
      {grupos.map((g) => (
        <View key={g.nome} style={{ gap: 4 }}>
          <Text style={[tipo.nota, { color: c.apoio, fontWeight: '600' }]} numberOfLines={1}>
            {g.nome}
          </Text>
          {g.topicos.slice(0, 3).map((t) => (
            <Text key={t.texto} style={[tipo.subtitulo, { color: c.texto }]} numberOfLines={1}>
              ○ {t.texto}
            </Text>
          ))}
        </View>
      ))}
      {resto > 0 ? <Text style={[tipo.nota, { color: c.apoio }]}>e mais {resto} na próxima tela</Text> : null}
    </View>
  );
}

function falaDoMascote(tipoEntrada: 'vazia' | 'link' | 'texto', lendo: boolean, temPrevia: boolean, temErro: boolean) {
  if (tipoEntrada === 'vazia')
    return (
      <>
        Cola o <Destaque>link do curso</Destaque> ou a <Destaque>lista de aulas</Destaque>. Eu organizo.
      </>
    );
  if (tipoEntrada === 'link') {
    if (lendo) return <>Achei um link. Estou lendo a página.</>;
    if (temErro) return <>Essa página não me mostrou as aulas. Cola a lista que eu organizo.</>;
    if (temPrevia)
      return (
        <>
          <Destaque>Pronto.</Destaque> Confere se ficou bom.
        </>
      );
    return <>Achei um link.</>;
  }
  return temPrevia ? (
    <>
      <Destaque>Cada linha virou um tópico.</Destaque> Títulos de módulo viraram grupos.
    </>
  ) : (
    <>Continua colando. Cada linha vira um tópico.</>
  );
}

function legendaDoTexto(s: SumarioImportado): string {
  if (s.truncado) return 'Usei as primeiras 300 linhas';
  if (s.linhasIgnoradas > 0) return `Deixei de fora ${s.linhasIgnoradas} ${s.linhasIgnoradas === 1 ? 'linha que não era aula' : 'linhas que não eram aulas'}`;
  return 'Organizado a partir do texto colado';
}
