import { router } from 'expo-router';
import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { importarSumario, resumo } from '@/domain/sumario';
import { salvarEstudo } from '@/features/comecar';
import { useRascunho } from '@/state/rascunho';
import { Botao, Cartao, Destaque, Etapas, Fala, Icone, Rotulo, Tela } from '@/ui/componentes';
import { raio, tipo } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

// Começar 2 (FR-002): colar o sumário; cada linha vira um tópico, linhas de módulo viram grupos.
export default function ComecarSumario() {
  const c = useCores();
  const { tipo: tipoEstudo, nome, sumario, estudoId, definir } = useRascunho();
  const [digitando, setDigitando] = useState(false);
  const campo = useRef<ComponentRef<typeof TextInput>>(null);

  const previa = useMemo(() => importarSumario(sumario, nome || 'Meu estudo'), [sumario, nome]);
  const temTopicos = previa.totalTopicos > 0;

  function continuar() {
    const { estudoId: novo } = salvarEstudo({ tipo: tipoEstudo, nome: nome.trim(), sumario, substituirId: estudoId });
    definir({ estudoId: novo });
    router.push('/comecar/ate-onde');
  }

  return (
    <Tela rodape={<Botao desabilitado={!temTopicos} onPress={continuar}>Continuar</Botao>}>
        <Etapas atual={2} total={3} />
        <Fala>
          {digitando ? (
            <>
              Escreve os tópicos, <Destaque>um por linha.</Destaque>
            </>
          ) : (
            <>
              Cola o sumário do curso. <Destaque>Cada linha vira um tópico.</Destaque>
            </>
          )}
        </Fala>

        <View style={{ gap: 12 }}>
          <Rotulo>{digitando ? 'Tópicos' : 'Sumário'}</Rotulo>
          <TextInput
            ref={campo}
            value={sumario}
            onChangeText={(v) => definir({ sumario: v })}
            multiline
            placeholder={digitando ? 'Introdução\nVariáveis e tipos\nFunções' : 'Cole aqui o sumário do curso ou o guia da prova'}
            placeholderTextColor={c.apoio}
            accessibilityLabel={digitando ? 'Tópicos, um por linha' : 'Sumário colado'}
            style={[tipo.corpo, { height: 220, borderRadius: raio.celula, backgroundColor: c.celula, color: c.texto, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, textAlignVertical: 'top' }]}
          />
        </View>

        {temTopicos ? (
          <Cartao estilo={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
            <Icone simbolo="list.bullet" />
            <View style={{ flex: 1 }}>
              <Text style={[tipo.corpoForte, { color: c.texto }]}>{resumo(previa)}</Text>
              <Text style={[tipo.subtitulo, { color: c.apoio }]}>
                {previa.truncado ? 'Usei as primeiras 300 linhas' : previa.grupos.length > 1 ? 'Linhas com "Módulo" viram grupos' : 'Dá para editar depois'}
              </Text>
            </View>
          </Cartao>
        ) : (
          <Botao
            tipo="texto"
            onPress={() => {
              setDigitando((d) => !d);
              campo.current?.focus();
            }}
          >
            {digitando ? 'Tenho o sumário · colar' : 'Não tenho o sumário · digitar os tópicos'}
          </Botao>
        )}
    </Tela>
  );
}
