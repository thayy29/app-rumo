import { asc, count, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { type ReactNode, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db, schema } from '@/data/db';
import { porcentagem, resumo } from '@/domain/sumario';
import { formatar, restanteMs } from '@/domain/timer';
import {
  apagarTudo,
  encerrarBloco,
  iniciarBloco,
  marcarAteOTopico,
  pausarOuRetomar,
  salvarSumario,
} from '@/features/spike';
import { agendarEmSegundos, agendarLembreteDiario, pedirPermissao, pendentes } from '@/platform/notificacoes';
import type { Cores } from '@/ui/tokens';
import { useCores } from '@/ui/useCores';

const { estudo, grupo, topico, bloco } = schema;

const SUMARIO_EXEMPLO = `Módulo 1 · Conceitos de nuvem
1. O que é computação em nuvem
2. Regiões e zonas de disponibilidade
3. Modelos de implantação
Módulo 2 · Segurança
1. Responsabilidade compartilhada
2. Contas e conta root
3. IAM: usuários e grupos
4. IAM: políticas
5. Criptografia e KMS
Módulo 3 · Cobrança e preços
1. Modelos de preço
2. Calculadora de custos`;

export default function Spike() {
  const c = useCores();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.fundo }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40, gap: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: 4 }}>
        <Text style={{ color: c.texto, fontSize: 34, fontWeight: '700', letterSpacing: 0.37 }}>Spike</Text>
        <Text style={{ color: c.apoio, fontSize: 15 }}>Semana 1 · 5 testes no seu iPhone</Text>
      </View>
      <TesteBanco c={c} />
      <TesteSumario c={c} />
      <TesteTimer c={c} />
      <TesteNotificacao c={c} />
      <TesteSheet c={c} />
    </ScrollView>
  );
}

function TesteBanco({ c }: { c: Cores }) {
  const { data: e } = useLiveQuery(db.select({ n: count() }).from(estudo));
  const { data: t } = useLiveQuery(db.select({ n: count() }).from(topico));
  const { data: f } = useLiveQuery(db.select({ n: count() }).from(topico).where(isNotNull(topico.feitoEm)));
  return (
    <Cartao c={c} numero={1} titulo="Banco local" como="Importe um sumário no teste 2. Feche o app à força (deslize para cima no seletor de apps) e reabra. Os números abaixo devem continuar iguais.">
      <Linha c={c} rotulo="Estudos gravados" valor={String(e[0]?.n ?? 0)} />
      <Linha c={c} rotulo="Tópicos gravados" valor={String(t[0]?.n ?? 0)} />
      <Linha c={c} rotulo="Tópicos feitos" valor={String(f[0]?.n ?? 0)} />
      <Botao c={c} tipo="secundario" onPress={() => apagarTudo()}>
        Apagar tudo
      </Botao>
    </Cartao>
  );
}

function TesteSumario({ c }: { c: Cores }) {
  const [nome, setNome] = useState('AWS Cloud Practitioner');
  const [texto, setTexto] = useState(SUMARIO_EXEMPLO);
  const [msg, setMsg] = useState('');

  const { data: ultimo } = useLiveQuery(db.select().from(estudo).orderBy(desc(estudo.criadoEm)).limit(1));
  const estudoId = ultimo[0]?.id ?? '';
  const { data: topicos } = useLiveQuery(
    db
      .select({ id: topico.id, texto: topico.texto, feitoEm: topico.feitoEm, grupo: grupo.nome })
      .from(topico)
      .innerJoin(grupo, eq(topico.grupoId, grupo.id))
      .where(eq(grupo.estudoId, estudoId))
      .orderBy(asc(grupo.ordem), asc(topico.ordem)),
    [estudoId],
  );
  const feitos = topicos.filter((x) => x.feitoEm !== null).length;

  return (
    <Cartao c={c} numero={2} titulo="Colar o sumário" como="Troque o texto por um sumário real (copie de um curso seu) e toque em Importar. Depois toque no último tópico que você terminou.">
      <TextInput value={nome} onChangeText={setNome} placeholder="Nome do estudo" placeholderTextColor={c.apoio} style={campo(c)} />
      <TextInput
        value={texto}
        onChangeText={setTexto}
        multiline
        placeholder="Cole o sumário aqui"
        placeholderTextColor={c.apoio}
        style={[campo(c), { minHeight: 150, paddingTop: 12, textAlignVertical: 'top' }]}
      />
      <Botao
        c={c}
        onPress={() => {
          const s = salvarSumario(nome.trim() || 'Meu estudo', texto);
          setMsg(resumo(s) + (s.truncado ? ' (cortado em 300 linhas)' : ''));
        }}
      >
        Importar
      </Botao>
      {msg ? <Text style={{ color: c.ok, fontSize: 15, fontWeight: '600' }}>{msg}</Text> : null}
      {topicos.length > 0 ? (
        <View style={{ gap: 2 }}>
          <Text style={{ color: c.texto, fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
            {porcentagem(feitos, topicos.length)}% <Text style={{ fontSize: 15, fontWeight: '400', color: c.apoio }}>já feito</Text>
          </Text>
          {topicos.slice(0, 14).map((x, i) => (
            <Pressable
              key={x.id}
              accessibilityRole="button"
              accessibilityLabel={`Marcar até ${x.texto}`}
              onPress={() => {
                marcarAteOTopico(estudoId, i);
                void Haptics.selectionAsync();
              }}
              style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 0.5, borderColor: c.linha }}
            >
              <Text style={{ width: 22, color: x.feitoEm ? c.ok : c.apoio, fontSize: 15 }}>{x.feitoEm ? '✓' : '○'}</Text>
              <Text style={{ flex: 1, color: c.texto, fontSize: 16, textDecorationLine: x.feitoEm ? 'line-through' : 'none' }}>
                {x.texto}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Cartao>
  );
}

function TesteTimer({ c }: { c: Cores }) {
  const { data } = useLiveQuery(db.select().from(bloco).where(isNull(bloco.encerradoEm)).limit(1));
  const b = data[0];
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (!b) return;
    const t = setInterval(() => setAgora(Date.now()), 250);
    return () => clearInterval(t);
  }, [b]);

  const resta = b ? restanteMs(b, agora) : 0;
  return (
    <Cartao c={c} numero={3} titulo="Timer por carimbos" como="Comece um bloco de 1 min, feche o app à força e espere. A notificação de fim deve chegar. Reabra: o tempo mostrado deve bater com o relógio. Teste também pausar e retomar.">
      <Text style={{ color: c.texto, fontSize: 56, fontWeight: '700', textAlign: 'center', fontVariant: ['tabular-nums'] }}>
        {b ? formatar(resta) : '--:--'}
      </Text>
      {b?.pausadoEm ? <Text style={{ color: c.apoio, textAlign: 'center' }}>pausado</Text> : null}
      {!b ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Botao c={c} flex onPress={() => void comecar(1)}>
            Começar 1 min
          </Botao>
          <Botao c={c} flex tipo="secundario" onPress={() => void comecar(25)}>
            25 min
          </Botao>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Botao c={c} flex tipo="secundario" onPress={() => void pausarOuRetomar()}>
            {b.pausadoEm ? 'Retomar' : 'Pausar'}
          </Botao>
          <Botao c={c} flex onPress={() => void encerrarBloco()}>
            {resta === 0 ? 'Fechar bloco' : 'Terminei'}
          </Botao>
        </View>
      )}
    </Cartao>
  );

  async function comecar(min: number) {
    if (!(await pedirPermissao())) Alert.alert('Sem permissão', 'O timer funciona, mas o aviso de fim não vai aparecer.');
    await iniciarBloco(min);
  }
}

function TesteNotificacao({ c }: { c: Cores }) {
  const [n, setN] = useState<number | null>(null);
  const atualizar = async () => setN(await pendentes());

  return (
    <Cartao c={c} numero={4} titulo="Notificações locais" como="Toque em Lembrete em 2 min e feche o app. A notificação deve chegar com o app fechado. O lembrete diário fica agendado para as 20h.">
      <Botao
        c={c}
        onPress={async () => {
          if (!(await pedirPermissao())) return Alert.alert('Permissão negada', 'Ative em Ajustes > Expo Go > Notificações.');
          await agendarEmSegundos(120);
          await atualizar();
        }}
      >
        Lembrete em 2 min
      </Botao>
      <Botao
        c={c}
        tipo="secundario"
        onPress={async () => {
          if (!(await pedirPermissao())) return;
          await agendarLembreteDiario(20, 0);
          await atualizar();
        }}
      >
        Lembrete diário às 20h
      </Botao>
      {n !== null ? <Linha c={c} rotulo="Agendadas agora" valor={String(n)} /> : null}
    </Cartao>
  );
}

function TesteSheet({ c }: { c: Cores }) {
  return (
    <Cartao c={c} numero={5} titulo="Sheet nativa" como="Abra a sheet, arraste para cima e para baixo e feche arrastando.">
      <Link href="/sheet" asChild>
        <Pressable accessibilityRole="button" style={botaoEstilo(c, 'principal', false)}>
          <Text style={{ color: c.acaoTexto, fontSize: 17, fontWeight: '600' }}>Abrir sheet</Text>
        </Pressable>
      </Link>
    </Cartao>
  );
}

// ---- componentes de apoio ----

function Cartao({ c, numero, titulo, como, children }: { c: Cores; numero: number; titulo: string; como: string; children: ReactNode }) {
  return (
    <View style={{ backgroundColor: c.celula, borderRadius: 20, padding: 16, gap: 12 }}>
      <Text style={{ color: c.link, fontSize: 13, fontWeight: '600' }}>TESTE {numero}</Text>
      <Text style={{ color: c.texto, fontSize: 20, fontWeight: '600' }}>{titulo}</Text>
      <Text style={{ color: c.apoio, fontSize: 15, lineHeight: 20 }}>{como}</Text>
      {children}
    </View>
  );
}

function Linha({ c, rotulo, valor }: { c: Cores; rotulo: string; valor: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', minHeight: 32, alignItems: 'center' }}>
      <Text style={{ color: c.texto, fontSize: 17 }}>{rotulo}</Text>
      <Text style={{ color: c.apoio, fontSize: 17, fontVariant: ['tabular-nums'] }}>{valor}</Text>
    </View>
  );
}

type TipoBotao = 'principal' | 'secundario';

function botaoEstilo(c: Cores, tipo: TipoBotao, flex: boolean) {
  return {
    height: 50,
    borderRadius: 999,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: tipo === 'principal' ? c.acao : c.linha,
    ...(flex ? { flex: 1 } : {}),
  };
}

function Botao({ c, tipo = 'principal', flex = false, onPress, children }: { c: Cores; tipo?: TipoBotao; flex?: boolean; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [botaoEstilo(c, tipo, flex), { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      <Text style={{ color: tipo === 'principal' ? c.acaoTexto : c.texto, fontSize: 17, fontWeight: '600' }}>{children}</Text>
    </Pressable>
  );
}

function campo(c: Cores) {
  return {
    backgroundColor: c.fundo,
    color: c.texto,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 16,
  };
}
