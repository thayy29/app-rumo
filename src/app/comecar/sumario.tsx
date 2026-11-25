import { router } from 'expo-router';
import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';

import { importarSumario, resumo, type SumarioImportado } from '@/domain/sumario';
import { importarPorLink, salvarEstudo } from '@/features/comecar';
import { useRascunho } from '@/state/rascunho';
import { Botao, Cartao, Destaque, Etapas, Fala, Icone, Rotulo, Tela } from '@/ui/componentes';
import { raio, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

type Modo = 'link' | 'texto';

// Começar 2 (FR-002 + ADR-014): link do guia de certificação Microsoft ou texto colado.
export default function ComecarSumario() {
  const c = useCores();
  const r = useRascunho();
  const [modo, setModo] = useState<Modo>(r.tipo === 'certificacao' ? 'link' : 'texto');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const campoTexto = useRef<ComponentRef<typeof TextInput>>(null);

  const doTexto = useMemo(() => importarSumario(r.sumario, r.nome || 'Meu estudo'), [r.sumario, r.nome]);
  const previa: SumarioImportado | null = modo === 'link' ? r.doLink : doTexto.totalTopicos > 0 ? doTexto : null;

  async function lerLink() {
    if (!r.link.trim() || carregando) return;
    setCarregando(true);
    setErro('');
    const resultado = await importarPorLink(r.link);
    setCarregando(false);
    if (resultado.ok) r.definir({ doLink: resultado.sumario });
    else {
      r.definir({ doLink: null });
      setErro(resultado.mensagem);
    }
  }

  function continuar() {
    if (!previa) return;
    const { estudoId } = salvarEstudo({ tipo: r.tipo, nome: r.nome.trim(), importado: previa, substituirId: r.estudoId });
    r.definir({ estudoId });
    router.push('/comecar/ate-onde');
  }

  function trocarModo(novo: Modo) {
    setModo(novo);
    setErro('');
    if (novo === 'texto') setTimeout(() => campoTexto.current?.focus(), 100);
  }

  return (
    <Tela rodape={<Botao desabilitado={!previa || carregando} onPress={continuar}>Continuar</Botao>}>
      <Etapas atual={2} total={3} />
      <Fala>
        {modo === 'link' ? (
          <>
            Cola o link do <Destaque>guia de estudo</Destaque> da prova.
          </>
        ) : (
          <>
            Cola o sumário do curso. <Destaque>Cada linha vira um tópico.</Destaque>
          </>
        )}
      </Fala>

      {modo === 'link' ? (
        <View style={{ gap: 12 }}>
          <Rotulo>Link do guia (Microsoft Learn)</Rotulo>
          <TextInput
            value={r.link}
            onChangeText={(v) => r.definir({ link: v, doLink: null })}
            placeholder="https://learn.microsoft.com/…/study-guides/ai-103"
            placeholderTextColor={c.apoio}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={lerLink}
            accessibilityLabel="Link do guia de estudo"
            style={[tipo.corpo, { height: 52, borderRadius: raio.celula, backgroundColor: c.celula, color: c.texto, paddingHorizontal: 16 }]}
          />
          {!r.doLink ? (
            carregando ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 50 }}>
                <ActivityIndicator color={c.acao} />
                <Text style={[tipo.subtitulo, { color: c.apoio }]}>Lendo o guia…</Text>
              </View>
            ) : (
              <Botao tipo="texto" desabilitado={!r.link.trim()} onPress={lerLink}>
                Ler o guia
              </Botao>
            )
          ) : null}
          {erro ? <Text style={[tipo.subtitulo, { color: c.alerta }]}>{erro}</Text> : null}
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <Rotulo>Sumário</Rotulo>
          <TextInput
            ref={campoTexto}
            value={r.sumario}
            onChangeText={(v) => r.definir({ sumario: v })}
            multiline
            placeholder={'Cole aqui o sumário do curso.\nOu escreva um tópico por linha.'}
            placeholderTextColor={c.apoio}
            accessibilityLabel="Sumário colado ou tópicos, um por linha"
            style={[tipo.corpo, { height: 220, borderRadius: raio.celula, backgroundColor: c.celula, color: c.texto, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, textAlignVertical: 'top' }]}
          />
        </View>
      )}

      {previa ? (
        <Cartao estilo={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
          <Icone simbolo={modo === 'link' ? 'checkmark' : 'list.bullet'} />
          <View style={{ flex: 1 }}>
            <Text style={[tipo.corpoForte, { color: c.texto }]}>{resumo(previa)}</Text>
            <Text style={[tipo.subtitulo, { color: c.apoio }]}>{legenda(modo, previa)}</Text>
          </View>
        </Cartao>
      ) : null}

      <Botao tipo="texto" onPress={() => trocarModo(modo === 'link' ? 'texto' : 'link')}>
        {modo === 'link' ? 'Não é Microsoft · colar o sumário' : 'É uma certificação Microsoft · usar o link'}
      </Botao>
    </Tela>
  );
}

function legenda(modo: Modo, s: SumarioImportado): string {
  if (modo === 'link') return 'Áreas da prova viram módulos e subtemas viram tópicos';
  if (s.truncado) return 'Usei as primeiras 300 linhas';
  if (s.linhasIgnoradas > 0) return `Deixei de fora ${s.linhasIgnoradas} ${s.linhasIgnoradas === 1 ? 'linha' : 'linhas'} de texto corrido`;
  return s.grupos.length > 1 ? 'Linhas com "Módulo" viram grupos' : 'Dá para editar depois';
}
