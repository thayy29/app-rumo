# System Architecture: Rumo

**Document Version:** 1.0
**Date:** 13/11/2026
**Author:** Winston (Architect) · redigido com Claude para Thayana
**Track:** Quick Flow (arquitetura enxuta, sem backend)
**Status:** Draft
**Source PRD:** `bmad-output/prd.md` v1.0 · UX: `DESIGN.md` e `EXPERIENCE.md` v1.0

> Fonte única das decisões técnicas transversais. Toda história herda as decisões marcadas como **TRAVADO** aqui.
> Prioridades pedidas pela dona: **custo zero, desempenho, stack JavaScript moderna e segura.**

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Pattern](#2-architecture-pattern)
3. [Architecture Decision Records](#3-architecture-decision-records)
4. [Component Design](#4-component-design)
5. [Data Model](#5-data-model)
6. [API Specifications](#6-api-specifications)
7. [FR / NFR Coverage Matrix](#7-fr--nfr-coverage-matrix)
8. [Technology Stack](#8-technology-stack)
9. [Trade-off Analysis](#9-trade-off-analysis)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Future Considerations](#11-future-considerations)

---

## 1. System Overview

### Purpose
App de iPhone que leva uma pessoa com TDAH de um objetivo até o dia 84, um passo por vez. Tudo roda no aparelho: sem servidor, sem conta, sem rede.

### Scope
**In Scope (v1):**
- Começar (objetivo + caminho sugerido por receita), Hoje, Foco com timer, Caminho, 5 sheets
- Persistência local, lembrete diário e aviso de fim de bloco por notificação local
- Regras de dia (tamanho, volta depois de sumir, ajuste automático de datas)
- Registro local de eventos para as métricas da validação, exportável em JSON

**Out of Scope (v1):**
- Backend, conta, login, sincronização, push remoto, IA, analytics de terceiros
- Android, iPad, web (o código não impede, mas nada é testado ou desenhado para isso)
- Widgets e Live Activities (exigem build próprio, fora do Expo Go)

### Architectural Drivers
1. **NFR-009: Validação sem custo** — obriga a rodar no **Expo Go** durante a validação. Isso limita as bibliotecas às que já vêm no Expo Go: nada de módulo nativo próprio.
2. **NFR-004: Nenhum dado perdido** — toda ação grava no SQLite **antes** do retorno visual; o banco é a fonte da verdade, nunca a memória.
3. **NFR-003: Precisão do timer** — o tempo é calculado a partir de carimbos de horário, não de um contador; o fim do bloco é uma notificação local agendada.
4. **NFR-001 / NFR-002: Abrir em 1 s e responder em 100 ms** — sem rede, sem tela de carregamento, leituras síncronas pequenas, animações na thread de UI.
5. **NFR-005: Privacidade local** — zero requisições de rede; nenhum SDK que chame servidor.

### Stakeholders & Constraints (from project-context.md)
- **Users:** adultos com TDAH, iPhone com iOS recente (o SDK escolhido define o mínimo; hoje iOS 16.4+).
- **Team:** 1 pessoa, desenvolvedora frontend pleno, forte em React e TypeScript, tempo parcial. Isso pede **pouca peça nova**: React, TypeScript e SQL simples.
- **Existing constraints:** R$ 0 na validação; sem engenharia reversa de outros apps; design já aprovado no canvas "App pessoal — telas da v1".

---

## 2. Architecture Pattern

**Pattern:** Monólito modular em camadas, 100% no cliente (*local-first*).

**Justification:**
- Quick Flow, 1 dev, sem servidor: qualquer coisa além de um app só é custo sem benefício.
- Separar **domínio puro** (regras do Rumo em funções TypeScript sem React) de **dados** e de **telas** deixa as regras difíceis (dia, volta, datas) testáveis em milissegundos e reaproveitáveis quando houver sincronização.

**Alternatives considered:**
- **App + backend (Supabase/Firebase):** rejeitado; fere NFR-005 e NFR-009 e adiciona login antes do valor.
- **PWA:** rejeitado; o iOS não agenda notificação local sem servidor de push, e o lembrete é Must (FR-010).
- **Swift nativo:** rejeitado; exige Mac + conta paga para distribuir e foge da competência principal da dona (React/TS).

**Application:**
```
app/            telas (expo-router)      → só desenha e chama casos de uso
src/features/   casos de uso por epic    → orquestram domínio + dados + notificações
src/domain/     regras puras             → sem React, sem SQLite, 100% testável
src/data/       SQLite + Drizzle         → schema, migrações, repositórios
src/platform/   notificações, háptica, arquivos, relógio
src/ui/         tokens e componentes do DESIGN.md
src/receitas/   receitas de caminho em JSON
```
Regra de dependência (TRAVADO): `app → features → (domain, data, platform)`; `domain` não importa nada de fora dele; `ui` não importa `data`.

---

## 3. Architecture Decision Records

| ADR | Title | Status | Drives |
|-----|-------|--------|--------|
| ADR-001 | Expo + React Native + TypeScript estrito, só bibliotecas do Expo Go | Accepted | NFR-009, NFR-001 |
| ADR-002 | SQLite local com Drizzle ORM, gravação antes do retorno visual | Accepted | NFR-004, FR-001…017 |
| ADR-003 | Sem autenticação e sem rede na v1 | Accepted | NFR-005 |
| ADR-004 | Estado: banco como verdade, consultas reativas, Zustand só para UI efêmera | Accepted | NFR-002, NFR-004 |
| ADR-005 | Regras em domínio puro; erros como `Result`, sem exceções entre camadas | Accepted | FR-005, FR-009, FR-011, FR-012 |
| ADR-006 | Convenções de nome e de datas | Accepted | todos |
| ADR-007 | Navegação com expo-router: pilha única e sheets nativas | Accepted | FR-004, FR-013, NFR-007 |
| ADR-008 | Tempo por carimbos; dia vira às 4h; notificações locais com orçamento | Accepted | FR-006, FR-010, FR-011, NFR-003 |
| ADR-009 | Receitas de caminho como dados validados | Accepted | FR-002, NFR-008 |
| ADR-010 | UI: tokens próprios, StyleSheet, Reanimated, componentes nativos do iOS | Accepted | NFR-002, NFR-006 |
| ADR-011 | Distribuição: Expo Go primeiro, com porta de decisão antes das testadoras | Accepted | NFR-009 |
| ADR-012 | Métricas por registro local de eventos, exportado pela pessoa | Accepted | Success Metrics, NFR-005 |
| ADR-013 | Qualidade e cadeia de dependências | Accepted | NFR-004, segurança |

### ADR-001: Expo + React Native + TypeScript estrito, só bibliotecas do Expo Go

**Status:** Accepted   **Drives:** NFR-009, NFR-001, NFR-002

**Context:** Precisa rodar num iPhone sem a conta paga da Apple. O Expo Go é um app da loja que carrega o JavaScript do projeto; em troca, só aceita os módulos nativos que já traz embutidos.

**Decision:**
- Expo SDK **na versão que o Expo Go da App Store suportar no dia do spike** (hoje, SDK 57 com React Native 0.86 ou SDK 58 com React Native 0.88). Criar com `npx create-expo-app@latest` e escolher essa versão.
- Nova arquitetura do React Native e Hermes (padrões do SDK).
- TypeScript com `strict: true`, `noUncheckedIndexedAccess: true`.
- Toda dependência entra com `npx expo install` (versão casada com o SDK).
- **Lista permitida** de módulos nativos (todos presentes no Expo Go): `expo-router`, `expo-sqlite`, `expo-notifications`, `expo-haptics`, `expo-symbols`, `expo-blur`, `expo-file-system`, `expo-sharing`, `expo-localization`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`. Bibliotecas só JavaScript são livres se passarem pela ADR-013.

**Consequences — TRAVADO para todas as histórias:** nenhuma história adiciona módulo nativo fora da lista permitida sem uma nova ADR.
- Mais fácil: rodar no próprio iPhone em minutos, recarregar ao salvar, custo zero.
- Custo aceito: sem widgets, Live Activities e bibliotecas nativas como MMKV. Mitigação: nada disso é Must na v1.

**Alternatives:** build de desenvolvimento (exige conta paga para instalar em iPhone além do próprio por 7 dias); Swift (ver seção 2).

**Revisit when:** a validação passar e o app for para a App Store (aí entra build de desenvolvimento/EAS Build).

### ADR-002: SQLite local com Drizzle ORM, gravação antes do retorno visual

**Status:** Accepted   **Drives:** NFR-004, NFR-001, todos os FR com dados

**Context:** Dados relacionais (objetivo → paradas → passos; dias → blocos), consultas por data e por estado, e zero perda em fechamento forçado.

**Decision:**
- `expo-sqlite` (API assíncrona e síncrona) com um arquivo `rumo.db`, `PRAGMA journal_mode = WAL` e `PRAGMA foreign_keys = ON` na abertura.
- **Drizzle ORM** (`drizzle-orm/expo-sqlite`) para schema tipado e consultas; **migrações geradas pelo drizzle-kit e embutidas no bundle**, aplicadas na abertura com `useMigrations` antes de qualquer tela.
- Toda ação da pessoa é **um caso de uso = uma transação**. A UI só muda depois que a transação confirma (leva < 5 ms no aparelho; é invisível).
- Preferências simples (tema, duração do bloco, horário do lembrete) ficam na tabela `ajustes`, não em AsyncStorage.

**Consequences — TRAVADO:** nenhuma tela grava fora de um caso de uso em `src/features`; nenhum estado de negócio vive só na memória.
- Mais fácil: desfazer, métricas e exportação saem do mesmo banco; tipos de ponta a ponta.
- Custo aceito: migrações precisam ser cuidadas desde o dia 1. Mitigação: teste de migração do zero e da versão anterior (ADR-013).

**Alternatives:** AsyncStorage/JSON (sem consultas, sem transação); WatermelonDB (nativo fora do Expo Go); MMKV (nativo fora do Expo Go); SQL cru sem ORM (perde tipos; aceitável, mas o Drizzle custa ~30 KB e evita erros).

**Revisit when:** houver sincronização (avaliar um motor de sync sobre o mesmo SQLite).

### ADR-003: Sem autenticação e sem rede na v1

**Status:** Accepted   **Drives:** NFR-005, FR-001

**Context:** Login antes do valor derruba ativação; dados ficam no aparelho; o PRD exige 0 requisições.

**Decision:** sem conta, sem token, sem `fetch`. Nenhum SDK de analytics, crash reporting ou anúncios. A tela de início mostra "Já tenho uma conta" só como lugar reservado (oculto na v1 por flag `CONTA_HABILITADA = false`). A exportação é um arquivo JSON gerado no aparelho e entregue pela folha de compartilhamento do iOS.

**Consequences — TRAVADO:** é proibido importar qualquer cliente HTTP ou SDK que fale com servidor. Revisão de dependências checa isso.
- Mais fácil: nada a proteger em trânsito; nenhum dado pessoal sai sem ação explícita.
- Custo aceito: troca de aparelho perde dados, salvo exportação. Mitigação: "Exportar" em Ajustes; importação fica para depois.

**Alternatives:** Sign in with Apple + sync agora (custo, conta paga, complexidade).

**Revisit when:** validação aprovada e pedido de testadoras por backup/sincronização.

### ADR-004: Estado — banco como verdade, consultas reativas, Zustand só para UI efêmera

**Status:** Accepted   **Drives:** NFR-002, NFR-004, FR-004, FR-009

**Context:** Sem servidor, não há "estado remoto" para cachear. O que importa é a tela refletir o banco na hora.

**Decision:**
- Dados de negócio: lidos com `useLiveQuery` do Drizzle (re-renderiza quando a tabela muda). Sem Redux, sem React Query.
- Estado efêmero de UI (sheet aberta, passo em edição, segundo atual do relógio): `useState` local; se compartilhado entre telas, **um** store Zustand (`src/features/sessao.ts`).
- O relógio do Foco renderiza a partir de `Date.now()` num `requestAnimationFrame`/intervalo de 250 ms **só enquanto a tela está visível**.

**Consequences — TRAVADO:** nenhum dado de negócio é copiado para Zustand; Zustand não persiste.
- Mais fácil: uma fonte de verdade; nada dessincroniza.
- Custo aceito: consultas reativas re-renderizam a tela inteira se mal recortadas. Mitigação: consultas pequenas por componente, `React.memo` nos itens de lista.

**Alternatives:** Redux Toolkit (cerimônia sem ganho), Jotai (equivalente; Zustand é mais conhecido).

**Revisit when:** sincronização entrar (aí o estado remoto pede outra camada).

### ADR-005: Regras em domínio puro; erros como `Result`, sem exceções entre camadas

**Status:** Accepted   **Drives:** FR-005, FR-008, FR-009, FR-011, FR-012, FR-015

**Context:** As regras que fazem o produto funcionar (tamanho do dia, volta depois de 2+ dias, empurrar datas após 7+, desfazer até o próximo bloco, celebração ao fechar parada) são as mais fáceis de errar e as mais caras de testar pela tela.

**Decision:**
- `src/domain/` contém funções puras: recebem dados e "agora", devolvem decisões. Ex.: `estadoDoHoje(dados, agora)`, `ajustarDatas(paradas, diasFora)`, `fecharBloco(bloco, resposta)`.
- Nada em `domain` lê relógio, banco ou plataforma. O "agora" chega por parâmetro (relógio injetável em `src/platform/relogio.ts`).
- Erro esperado é valor, não exceção: `type Result<T> = { ok: true; valor: T } | { ok: false; erro: ErroRumo }`, com `ErroRumo` = união de códigos (`'PASSO_VAZIO' | 'GRAVACAO_FALHOU' | 'LEMBRETE_NEGADO' | ...`).
- A UI traduz códigos em textos de um catálogo único (`src/ui/textos.ts`), que nunca usa "falha", "atraso" ou "sequência" (FR-011).
- Exceções só para bug; uma *error boundary* na raiz mostra "Algo saiu do lugar. Tocar para recarregar" e grava o erro no log local.

**Consequences — TRAVADO:** todo caso de uso retorna `Result`; nenhuma tela faz `try/catch` de regra de negócio.
- Mais fácil: testar as regras sem simulador; textos consistentes.
- Custo aceito: um pouco de código de encaixe. Mitigação: helpers `ok()`/`erro()`.

**Alternatives:** lógica dentro dos componentes (rápido de começar, impossível de testar); exceções (fluxo escondido).

**Revisit when:** nunca na v1.

### ADR-006: Convenções de nome e de datas (naming conventions)

**Status:** Accepted   **Drives:** todos

**Decision (TRAVADO):**
- **Termos do domínio em português**, iguais aos do PRD e da UI: `Objetivo`, `Parada`, `Passo`, `Dia`, `Bloco`, `Anotacao` (o "Pra depois"), `Ajustes`, `Evento`. Termos técnicos seguem o padrão do ecossistema (`useAlgo`, `Result`, `Screen`).
- Arquivos: `kebab-case.ts`; componentes React: `PascalCase.tsx`; funções e variáveis: `camelCase`; constantes: `UPPER_SNAKE`.
- Banco: tabelas no singular em `snake_case` (`passo`, `anotacao`); colunas `snake_case`; o Drizzle mapeia para `camelCase` no TypeScript.
- IDs: texto `crypto.randomUUID()` (UUID v4) — pronto para sincronização futura sem colisão.
- **Instantes** (quando algo aconteceu): inteiro em milissegundos UTC (`*_em`, ex.: `iniciado_em`).
- **Dia do calendário** (a que dia algo pertence): texto `YYYY-MM-DD` no fuso do aparelho, com virada às 4h (ADR-008), coluna `data_dia`.
- Datas das paradas: `data_dia` também (não instante).

**Consequences:** qualquer história lê o schema e o código sem tradução mental.

**Alternatives:** tudo em inglês (menos ruído com bibliotecas, mas desalinha com PRD, UX e copy).

**Revisit when:** entrar alguém que não lê português no time.

### ADR-007: Navegação com expo-router — pilha única e sheets nativas

**Status:** Accepted   **Drives:** FR-004, FR-013, NFR-007, NFR-006

**Context:** Sem barra de abas; o Hoje é a casa; 5 sheets com cara de iOS.

**Decision:**
- `expo-router` com **uma pilha** (`Stack`). Rotas:
  - `/inicio` · `/comecar/objetivo` · `/comecar/caminho`
  - `/` (Hoje) · `/foco` · `/caminho`
  - sheets: `/sheet/dia-dificil` · `/sheet/travou` · `/sheet/fechamento` · `/sheet/semana` · `/sheet/ajustes` · `/sheet/anotar`
- Sheets usam a apresentação nativa do iOS (`presentation: 'formSheet'` com `sheetAllowedDetents` e alça), não um componente desenhado à mão.
- O `_layout` raiz decide a primeira rota: sem objetivo → `/inicio`; bloco rodando → `/foco`; caso contrário → `/` (FR-004).
- Celebração é um estado do Hoje (modal de tela cheia, `presentation: 'fullScreenModal'`).

**Consequences — TRAVADO:** nenhuma história cria abas ou navegação paralela; toda sheet nova vira rota em `app/sheet/`.
- Mais fácil: gesto de fechar, recuo do fundo, VoiceOver e "reduzir movimento" vêm do sistema.
- Custo aceito: menos controle sobre o desenho exato da sheet (raio, afastamento). Mitigação: aceitar o padrão do iOS; o canvas é referência, o sistema manda.

**Alternatives:** React Navigation direto (o expo-router já é ele por baixo, com rotas por arquivo); sheets JS (`@gorhom/bottom-sheet`: mais controle, menos nativo, mais peso).

**Revisit when:** uma sheet precisar de algo que a nativa não faz.

### ADR-008: Tempo por carimbos; dia vira às 4h; notificações locais com orçamento

**Status:** Accepted   **Drives:** FR-006, FR-010, FR-011, FR-012, NFR-003

**Decision:**
- **Bloco:** grava `iniciado_em`, `duracao_ms`, `pausado_total_ms` e `pausado_em` (se pausado). Restante = `duracao_ms − (agora − iniciado_em − pausado_total_ms)`. Nada de contador em memória.
- Ao iniciar ou retomar: agenda **uma** notificação local para o fim (`DateTrigger`) e guarda o id no bloco; ao pausar, terminar ou cancelar: desagenda.
- Ao reabrir o app: se há bloco aberto e o tempo passou, abre o Fechamento (EXPERIENCE: "App encerrado durante o bloco").
- **Lembrete diário:** uma notificação repetida (`DailyTrigger`, hora e minuto de Ajustes). Só é pedida permissão no momento do FR-010. Orçamento: no máximo 2 notificações pendentes (o iOS aceita até 64).
- **Virada do dia às 4h no fuso do aparelho**: um bloco às 1h da manhã conta para o dia anterior. Função única `dataDia(instante, fuso)` em `domain`.
- "Dias sem bloco" (FR-011) = diferença entre o `data_dia` de hoje e o do último bloco com resposta.

**Consequences — TRAVADO:** ninguém usa `setInterval` como fonte de tempo; ninguém calcula "dia" fora de `dataDia`.
- Mais fácil: timer certo com app fechado, sem tarefa em segundo plano.
- Custo aceito: sem contagem visível na tela bloqueada (exigiria Live Activity). Mitigação: a notificação de fim cobre o essencial.

**Alternatives:** `expo-background-task` (não roda em intervalo garantido no iOS); meia-noite como virada (quebra o dia de quem trabalha tarde, comum no público).

**Revisit when:** sair do Expo Go (Live Activity do timer vira candidata).

### ADR-009: Receitas de caminho como dados validados

**Status:** Accepted   **Drives:** FR-002, NFR-008

**Decision:** um arquivo JSON por tipo em `src/receitas/` (`musica.json`, `codigo.json`, `estudo.json`, `texto.json`, `generica.json`), com `paradas[3]` (semana, texto-modelo) e `passos` por parada (4 a 6, cada um ≤ 3 blocos). Um schema **Zod** valida todos os arquivos num teste; o app importa estaticamente (sem carregar arquivo em tempo de execução). Placeholders como `{entrega}` são trocados pelo texto da pessoa.

**Consequences — TRAVADO:** nenhum texto de receita fica dentro de componente.
- Mais fácil: escrever e testar receitas sem tocar nas telas; receitas futuras por IA geram o mesmo formato.

**Alternatives:** receitas no banco (exige tela de edição); IA (custo, rede).

**Revisit when:** as 4 receitas não cobrirem os objetivos das testadoras.

### ADR-010: UI — tokens próprios, StyleSheet, Reanimated, componentes nativos do iOS

**Status:** Accepted   **Drives:** NFR-002, NFR-006, DESIGN.md

**Decision:**
- `src/ui/tokens.ts` espelha o DESIGN.md (cores claro/escuro, tipografia, espaçamento, raios). Tema por `useColorScheme()` + preferência em `ajustes`.
- Estilo com `StyleSheet.create` (sem biblioteca de CSS-in-JS em tempo de execução).
- Fonte do sistema (SF Pro); números do timer com `fontVariant: ['tabular-nums']` e a variante arredondada do sistema.
- Ícones: SF Symbols via `expo-symbols`. Mascote, logotipo, trilhas: SVG (`react-native-svg`).
- Animação: **Reanimated** com molas (sem quique, exceto o pulo do mascote ao concluir passo); `useReducedMotion()` troca por esmaecer de 200 ms.
- Vidro: `expo-blur` só nos botões de navegação; com "reduzir transparência" vira fundo sólido.
- Háptica (`expo-haptics`) só em: passo concluído, parada concluída, fim do bloco.
- Acessibilidade: todo controle com `accessibilityLabel`/`accessibilityRole`; fonte escala com Dynamic Type até AX3 (`maxFontSizeMultiplier` só onde quebraria o layout, nunca no corpo).

**Consequences — TRAVADO:** cor ou tamanho literal fora de `tokens.ts` reprova na revisão.

**Alternatives:** NativeWind/Tailwind (bom, mas uma camada a mais de compilação; sem ganho para 4 telas); Tamagui (pesado); Expo UI/SwiftUI (pronto para produção, mas acopla a componentes que nem todos estão no Expo Go — reavaliar fora dele).

**Revisit when:** o app crescer para além de ~10 telas.

### ADR-011: Distribuição — Expo Go primeiro, com porta de decisão antes das testadoras

**Status:** Accepted   **Drives:** NFR-009

**Context:** No iPhone, o Expo Go só abre projetos da conta Expo em que está logado ou de quem foi adicionado como membro dela. TestFlight e instalação por link exigem a conta paga da Apple (US$ 99/ano).

**Decision:**
- **Fase 0 (desenvolvimento):** Expo Go no iPhone da dona, logado na conta dela. Custo zero.
- **Fase 1 (testadoras), opção A — sem custo:** criar uma organização no Expo (plano gratuito), adicionar cada testadora como membro e publicar o JavaScript por **EAS Update** (plano gratuito); a testadora abre o projeto no Expo Go logada na própria conta. **A provar no spike** com 1 pessoa antes de recrutar.
- **Fase 1, opção B — se A falhar:** pagar a conta da Apple e distribuir build de desenvolvimento por TestFlight. Registrar a mudança no decision-log, porque fere a restrição de custo zero.

**Consequences — TRAVADO:** o código não pode depender de nada que só exista em build próprio, para manter a opção A viva.
- Custo aceito: a opção A pede que cada testadora crie conta no Expo e aceite um convite (atrito de ~3 min).

**Alternatives:** TestFlight direto (pago); Android primeiro (público da validação usa iPhone).

**Revisit when:** o spike da opção A terminar (sucesso ou falha).

### ADR-012: Métricas por registro local de eventos, exportado pela pessoa

**Status:** Accepted   **Drives:** Success Metrics do PRD, NFR-005

**Decision:** tabela `evento` (tipo, instante, dados JSON pequenos), gravada pelos casos de uso na mesma transação da ação: `app_aberto`, `objetivo_criado`, `bloco_iniciado`, `bloco_fechado`, `passo_concluido`, `dia_reduzido`, `voltou_apos_dias`, `lembrete_aceito`, `lembrete_recusado`, `semana_vista`. "Exportar" em Ajustes gera um JSON com dados + eventos; a testadora envia o arquivo à dona. Um script fora do app (`scripts/metricas.ts`) calcula ativação, W1, D14, retorno e passos/semana.

**Consequences — TRAVADO:** nenhum evento sai do aparelho sozinho; eventos não guardam texto escrito pela pessoa (só ids e contagens), para a exportação de métricas ser anônima por padrão.

**Alternatives:** PostHog/Amplitude (rede, SDK de terceiros, fere NFR-005).

**Revisit when:** houver backend e consentimento explícito.

### ADR-013: Qualidade e cadeia de dependências

**Status:** Accepted   **Drives:** NFR-004, segurança, manutenção

**Decision:**
- **Dependências mínimas:** além do SDK do Expo, só `drizzle-orm`, `zustand`, `zod` em tempo de execução; `drizzle-kit` em desenvolvimento. Cada nova dependência: mantida (commit nos últimos 6 meses), sem módulo nativo fora da ADR-001, sem chamada de rede, registrada no decision-log.
- `package-lock.json` versionado; `npm ci` na instalação; `npm audit --omit=dev` sem alertas altos antes de cada publicação; Renovate/Dependabot desligado na validação (atualizar junto com o SDK).
- **Lint e formato:** `eslint-config-expo` + Prettier; TypeScript estrito; regra de importação que proíbe `domain` de importar fora de si.
- **Estratégia de teste:** Jest com `jest-expo`. Unitários cobrindo 100% das funções de `src/domain`; teste de migração do banco (do zero e da versão anterior); teste de schema das receitas; testes de componente só para Hoje (estados) e Fechamento. Sem testes E2E na v1 — a passagem manual com VoiceOver (NFR-006) cobre o resto.
- **Segredos:** não existem na v1. Nenhum `.env` com chave.

**Consequences — TRAVADO:** uma história só fecha com `tsc --noEmit`, lint e testes de domínio passando.

**Alternatives:** Vitest (mais rápido, mas o ecossistema RN padroniza Jest); Detox/Maestro E2E (custo alto para 4 telas).

**Revisit when:** antes da App Store (avaliar Maestro).

---

## 4. Component Design

### Component Overview
```
┌────────────── app/ (telas, expo-router) ──────────────┐
│ inicio · comecar/* · index(Hoje) · foco · caminho     │
│ sheet/*                                               │
└──────────────┬────────────────────────────────────────┘
               │ chama casos de uso / lê consultas
┌──────────────▼──────────── src/features ──────────────┐
│ comecar · dia · foco · voltar · caminho · ajustes      │
└───────┬───────────────┬──────────────────┬────────────┘
        │               │                  │
┌───────▼──────┐ ┌──────▼───────┐ ┌────────▼─────────┐
│ src/domain   │ │ src/data     │ │ src/platform     │
│ regras puras │ │ SQLite+Drizzle│ │ notificações,    │
│              │ │ repositórios │ │ háptica, arquivos,│
└──────────────┘ └──────────────┘ │ relógio          │
                                  └──────────────────┘
src/ui (tokens, componentes) ← usado por app/
src/receitas (JSON) ← usado por domain/comecar
```

### Component: Telas (`app/`)
**Responsibility:** desenhar estados e encaminhar gestos para casos de uso.
**Interfaces Provided:** rotas da ADR-007.
**Interfaces Required:** `src/features/*`, `src/ui/*`.
**Data Owned:** nenhum (só estado efêmero).
**ADRs that constrain it:** ADR-004, ADR-007, ADR-010.
**NFRs Addressed:** NFR-002 (resposta no pressionar), NFR-006, NFR-007.

### Component: Casos de uso (`src/features/`)
**Responsibility:** uma função por ação da pessoa, que valida, aplica a regra, grava numa transação, agenda/desagenda notificações e registra o evento.
**Interfaces Provided:** ver seção 6.
**Interfaces Required:** `domain`, `data`, `platform`.
**Data Owned:** nenhum próprio; orquestra.
**ADRs that constrain it:** ADR-002, ADR-005, ADR-008, ADR-012.
**NFRs Addressed:** NFR-004 (transação antes do retorno).

### Component: Domínio (`src/domain/`)
**Responsibility:** regras do Rumo como funções puras.
**Interfaces Provided:** `dataDia`, `estadoDoHoje`, `tamanhoDoDia`, `fecharBloco`, `concluirPasso`, `diasFora`, `ajustarDatas`, `precisaRevisaoSemanal`, `paradaConcluida`, `instanciarReceita`.
**Interfaces Required:** nenhuma.
**Data Owned:** tipos do domínio.
**ADRs:** ADR-005, ADR-006, ADR-008, ADR-009.
**NFRs:** NFR-008 (receitas como dados), testabilidade.

### Component: Dados (`src/data/`)
**Responsibility:** abrir o banco, migrar, expor schema e repositórios.
**Interfaces Provided:** `db`, `schema`, repositórios por entidade, consultas reativas prontas (`useHoje`, `useCaminho`, `useAjustes`).
**Interfaces Required:** `expo-sqlite`, `drizzle-orm`.
**Data Owned:** todas as entidades da seção 5.
**ADRs:** ADR-002, ADR-006.
**NFRs:** NFR-001 (leituras pequenas e indexadas), NFR-004.

### Component: Plataforma (`src/platform/`)
**Responsibility:** isolar APIs do aparelho atrás de interfaces simples.
**Interfaces Provided:** `notificacoes.agendarFimBloco/cancelar/agendarLembreteDiario/pedirPermissao`, `haptica.sucesso/leve`, `arquivos.exportarJson`, `relogio.agora()`.
**Interfaces Required:** `expo-notifications`, `expo-haptics`, `expo-file-system`, `expo-sharing`.
**ADRs:** ADR-001, ADR-003, ADR-008.
**NFRs:** NFR-003, NFR-005.

### Component: UI (`src/ui/`)
**Responsibility:** tokens, componentes do DESIGN.md (Botão, Linha de lista, Cartão do passo, Mini-trilha, Mascote, Trilha do caminho, Faixa de erro) e catálogo de textos.
**ADRs:** ADR-010, ADR-005 (textos).
**NFRs:** NFR-006.

---

## 5. Data Model

> Governado pela ADR-002 e ADR-006. Todas as histórias compartilham estes formatos.

### Entity: objetivo
**Purpose:** o rumo atual ou passado.
**Attributes:**
- `id` (text, PK, UUID)
- `tipo` (text: `musica` | `codigo` | `estudo` | `texto` | `outro`)
- `entrega` (text, ≤ 80) — "o que estará pronto"
- `estado` (text: `ativo` | `concluido` | `interrompido`)
- `data_inicio` (text `YYYY-MM-DD`), `data_chegada` (text, ajustável)
- `concluido_em` (integer ms, nulo)
- `created_at` / `updated_at` (integer ms)
**Relationships:** 1:3 `parada`; 1:N `dia`.
**Indexes:** `estado`.
**Constraints:** no máximo **um** `objetivo` com `estado = 'ativo'` (índice único parcial).

### Entity: parada
**Attributes:** `id`, `objetivo_id` (FK), `ordem` (1–3), `texto`, `semana_prevista` (3/7/12), `data_prevista` (`YYYY-MM-DD`, ajustável), `concluida_em` (ms, nulo), `created_at`, `updated_at`.
**Constraints:** único (`objetivo_id`, `ordem`).

### Entity: passo
**Attributes:** `id`, `parada_id` (FK), `ordem` (inteiro, reordenável), `texto`, `estado` (`a_fazer` | `atual` | `feito`), `nota_onde_parei` (text ≤ 120, nulo), `continuacoes` (inteiro; 3 dispara "dividir em dois"), `concluido_em` (ms, nulo), `origem` (`receita` | `pessoa` | `anotacao`), `created_at`, `updated_at`.
**Indexes:** (`parada_id`, `ordem`); `estado`.
**Constraints:** no máximo um `passo` `atual` por objetivo ativo (garantido no caso de uso).

### Entity: dia
**Purpose:** o dia do calendário (com virada às 4h) e seu tamanho.
**Attributes:** `id`, `objetivo_id` (FK), `data_dia` (`YYYY-MM-DD`), `tamanho` (`bom` | `dificil` | `impossivel`), `contou` (boolean), `created_at`, `updated_at`.
**Constraints:** único (`objetivo_id`, `data_dia`).

### Entity: bloco
**Attributes:** `id`, `dia_id` (FK), `passo_id` (FK), `iniciado_em` (ms), `duracao_ms`, `pausado_total_ms`, `pausado_em` (ms, nulo), `notificacao_id` (text, nulo), `encerrado_em` (ms, nulo), `resposta` (`terminei` | `continua` | `outra_coisa` | `nao_rolou`, nulo), `reversivel` (boolean; vira falso quando o próximo bloco começa), `created_at`, `updated_at`.
**Indexes:** `encerrado_em` (achar bloco aberto), `dia_id`.

### Entity: anotacao (Pra depois)
**Attributes:** `id`, `objetivo_id` (FK), `texto` (≤ 200), `estado` (`aberta` | `virou_passo` | `apagada`), `created_at`, `updated_at`.

### Entity: ajustes
**Attributes:** `chave` (text, PK), `valor` (text JSON). Chaves: `tema`, `duracao_bloco_min` (15/25/45), `lembrete_hora`, `lembrete_permissao` (`nao_pedida` | `aceita` | `negada`), `ultima_semana_vista`, `versao_schema`.

### Entity: evento
**Attributes:** `id`, `tipo` (ver ADR-012), `em` (ms), `dados` (text JSON, sem texto livre da pessoa).
**Indexes:** `tipo`, `em`.

### Storage Strategy
- **Primary store:** SQLite local `rumo.db`, WAL, chaves estrangeiras ligadas (ADR-002).
- **Cache:** nenhum; o banco é rápido o bastante e é a verdade.
- **File/blob:** só o JSON de exportação, criado sob demanda no cache do app e apagado após compartilhar.
- **Retention / backup:** nada é apagado de verdade na v1 (objetivos interrompidos e anotações apagadas ficam com estado). Backup = exportar. Fora do backup do iCloud por padrão do Expo Go — avisar em Ajustes.

---

## 6. API Specifications

> Não há API HTTP (ADR-003). O contrato entre telas e lógica é a **API interna de casos de uso**, todos retornando `Promise<Result<T>>` (ADR-005), todos transacionais (ADR-002) e todos gravando evento (ADR-012).

**Protocol:** chamadas de função TypeScript em processo   **AuthN:** nenhuma (ADR-003)   **Versioning:** versão do schema do banco em `ajustes.versao_schema`; formato de exportação com campo `formato: 1`.

### `comecar` (EPIC-001)
- `criarObjetivo({ tipo, entrega }) → Result<{ objetivoId }>` — erros: `ENTREGA_VAZIA`, `ENTREGA_LONGA`, `JA_EXISTE_ATIVO`.
- `salvarCaminho({ objetivoId, paradas, passosParada1 }) → Result<void>` — erros: `PASSO_VAZIO`, `SEM_PASSOS`.

### `dia` (EPIC-002)
- `definirTamanhoDoDia({ tamanho }) → Result<void>`
- `iniciarBloco({ passoId, minutos? }) → Result<{ blocoId, fimEm }>` — agenda notificação; erro: `BLOCO_JA_ABERTO`.
- `pausarBloco / retomarBloco / cancelarBloco({ blocoId }) → Result<void>`
- `fecharBloco({ blocoId, resposta, nota?, outraCoisa? }) → Result<{ passoConcluido, paradaConcluida, faltam }>`
- `desfazerFechamento({ blocoId }) → Result<void>` — erro: `NAO_REVERSIVEL`.
- `travou({ blocoId, escolha: 'cinco_min' | 'nao_vai_rolar' }) → Result<void>`
- `responderLembrete({ aceitar, hora }) → Result<void>` — erro: `LEMBRETE_NEGADO`.

### `voltar` (EPIC-003)
- `abrirApp(agora) → Result<EstadoDoHoje>` — aplica volta (2+ dias) e ajuste de datas (7+ dias ou parada vencida), uma vez por dia.
- `desfazerAjusteDeDatas() → Result<void>`
- `marcarSemanaVista() → Result<void>`

### `caminho` (EPIC-004)
- `editarPasso / reordenarPassos / removerPasso / adicionarPasso`
- `anotar({ texto }) → Result<void>` · `anotacaoViraPasso({ id })` · `apagarAnotacao({ id })`
- `trocarObjetivo() → Result<void>` (marca o atual como `interrompido`)

### `ajustes`
- `salvarAjuste({ chave, valor })` · `exportarDados() → Result<{ arquivo }>`

**NFRs:** cada caso de uso conclui em ≤ 16 ms no iPhone 12 (um quadro), para o retorno visual em ≤ 100 ms (NFR-002) incluir a gravação.

---

## 7. FR / NFR Coverage Matrix

| ID | Type | Requirement | Component(s) | ADR(s) | Status |
|----|------|-------------|--------------|--------|--------|
| FR-001 | FR | Criar objetivo numa tela, sem conta | app/comecar, features/comecar | ADR-003, ADR-002 | Addressed |
| FR-002 | FR | Caminho sugerido e editável | domain/instanciarReceita, receitas, features/comecar | ADR-009 | Addressed |
| FR-003 | FR | Primeiro bloco direto do começo | app/comecar/caminho → /foco | ADR-007 | Addressed |
| FR-004 | FR | Hoje com um passo e a mini-trilha | app/index, domain/estadoDoHoje | ADR-004, ADR-007 | Addressed |
| FR-005 | FR | Tamanho do dia | domain/tamanhoDoDia, features/dia | ADR-005 | Addressed |
| FR-006 | FR | Foco com timer | app/foco, features/dia, platform/notificacoes | ADR-008 | Addressed |
| FR-007 | FR | Travou | app/sheet/travou, features/dia | ADR-005 | Addressed |
| FR-008 | FR | Fechamento do bloco | app/sheet/fechamento, domain/fecharBloco | ADR-005, ADR-002 | Addressed |
| FR-009 | FR | Atribuição ao caminho | domain/concluirPasso, ui/MiniTrilha | ADR-005, ADR-010 | Addressed |
| FR-010 | FR | Lembrete pedido no momento certo | features/dia, platform/notificacoes | ADR-008 | Addressed |
| FR-011 | FR | Voltar depois de sumir | domain/diasFora, ajustarDatas, features/voltar | ADR-005, ADR-008 | Addressed |
| FR-012 | FR | Revisão da semana | app/sheet/semana, domain/precisaRevisaoSemanal | ADR-005, ADR-007 | Addressed |
| FR-013 | FR | Caminho | app/caminho, data/useCaminho | ADR-004, ADR-007 | Addressed |
| FR-014 | FR | Pra depois | entidade anotacao, features/caminho | ADR-002 | Addressed |
| FR-015 | FR | Celebração de parada e de chegada | domain/paradaConcluida, app (fullScreenModal) | ADR-007, ADR-010 | Addressed |
| FR-016 | FR | Ajustes | app/sheet/ajustes, entidade ajustes, platform/arquivos | ADR-002, ADR-003 | Addressed |
| FR-017 | FR | Contar pra alguém | app/sheet/semana + Share do React Native | ADR-003 | Addressed |
| NFR-001 | NFR | Hoje em ≤ 1,0 s (quente) / 2,0 s (frio) | data (leituras indexadas), app/_layout | ADR-001, ADR-002, ADR-004 | Addressed |
| NFR-002 | NFR | Toque ≤ 100 ms, < 5% quadros perdidos | ui (Reanimated na thread de UI), features (≤ 16 ms) | ADR-004, ADR-010 | Addressed |
| NFR-003 | NFR | Timer ±1 s, aviso ≤ 5 s | domain (carimbos), platform/notificacoes | ADR-008 | Addressed |
| NFR-004 | NFR | 0 ações perdidas | features (transação antes do retorno), data (WAL) | ADR-002, ADR-005 | Addressed |
| NFR-005 | NFR | 0 requisições de rede | sem cliente HTTP, sem SDK de terceiros | ADR-003, ADR-012, ADR-013 | Addressed |
| NFR-006 | NFR | Acessibilidade WCAG AA, VoiceOver, AX3 | ui, sheets nativas | ADR-007, ADR-010 | Addressed |
| NFR-007 | NFR | ≤ 90 s até o primeiro bloco; ≤ 2 toques | app (rotas), ADR de navegação | ADR-007 | Addressed |
| NFR-008 | NFR | Receitas como dados | src/receitas + Zod | ADR-009 | Addressed |
| NFR-009 | NFR | R$ 0 na validação | Expo Go, EAS Update gratuito | ADR-001, ADR-011 | Partial — depende do spike da opção A |

### Cobertura por categoria de NFR
| Categoria | Onde é tratada |
|---|---|
| Performance (latência, response time) | NFR-001, NFR-002; ADR-002, ADR-004, ADR-010 |
| Security (sem authentication na v1, dados locais, supply chain) | NFR-005; ADR-003, ADR-012, ADR-013 |
| Reliability (backup, nenhum dado perdido) | NFR-003, NFR-004; ADR-002, ADR-008; backup por exportação |
| Scalability | Não se aplica: sem servidor, cada aparelho escala sozinho; caminho futuro na seção 11 |
| Availability | 100% offline; sem monitoring remoto por decisão (ADR-003) |
| Maintainability (module boundaries) | Camadas da seção 2; ADR-005, ADR-009, ADR-013 |

### Detailed NFR notes (per driver)
- **NFR-009:** o único ponto não garantido. Se a opção A da ADR-011 falhar, a saída custa US$ 99/ano. O resto da arquitetura não muda.
- **NFR-004:** WAL + transação por ação + UI só após confirmação. Teste: matar o app logo após cada uma das 8 ações principais.
- **NFR-003:** sem contador; notificação agendada no início. O erro máximo é o do relógio do sistema.
- **NFR-001:** nenhuma chamada de rede, nenhuma fonte para baixar, migração só roda quando a versão muda; a primeira tela lê ~4 linhas indexadas.
- **NFR-002:** escala no pressionar com Reanimated (thread de UI); casos de uso medidos em desenvolvimento com um `console.time` envolvendo a transação.

---

## 8. Technology Stack

| Layer | Choice | Version | Rationale (→ driver) | ADR |
|-------|--------|---------|----------------------|-----|
| Runtime | Expo (managed) + React Native, Hermes, nova arquitetura | SDK suportado pelo Expo Go da loja (57 ou 58) | Roda no iPhone sem conta paga (NFR-009) | ADR-001 |
| Linguagem | TypeScript estrito | a do SDK | Competência da dona; tipos do banco à tela | ADR-001 |
| UI | React 19 + StyleSheet + tokens próprios | a do SDK | Sem camada extra; desempenho (NFR-002) | ADR-010 |
| Navegação | expo-router (Stack, formSheet) | a do SDK | Sheets nativas, rotas por arquivo | ADR-007 |
| Animação | react-native-reanimated + gesture-handler | a do SDK | Molas na thread de UI | ADR-010 |
| Banco | expo-sqlite (WAL) | a do SDK | Transações, consultas, no Expo Go | ADR-002 |
| ORM | drizzle-orm + drizzle-kit | última estável | Schema tipado, migrações no bundle, consultas reativas | ADR-002 |
| Estado efêmero | zustand | 5.x | Pequeno, sem cerimônia | ADR-004 |
| Validação | zod | 4.x | Schema das receitas e da exportação | ADR-009 |
| Notificações | expo-notifications (só locais) | a do SDK | Lembrete e fim de bloco sem servidor | ADR-008 |
| Ícones / gráficos | expo-symbols, react-native-svg, expo-blur | a do SDK | SF Symbols, mascote, vidro | ADR-010 |
| Arquivos | expo-file-system, expo-sharing | a do SDK | Exportação local | ADR-003 |
| Qualidade | Jest (jest-expo), ESLint (eslint-config-expo), Prettier | a do SDK | Padrão do ecossistema | ADR-013 |
| Distribuição | Expo Go; EAS Update (plano gratuito) | — | Custo zero | ADR-011 |

**Alternatives considered:** Supabase/Firebase (rede e conta); NativeWind (camada extra); Redux Toolkit/React Query (sem servidor, sem ganho); MMKV/WatermelonDB (nativos fora do Expo Go); Flutter (fora da competência e sem Expo Go equivalente).

---

## 9. Trade-off Analysis

### Trade-off: Expo Go em vez de build próprio
**Decision:** Expo Go durante a validação (ADR-001, ADR-011).
**Options:** Expo Go (grátis, recarrega na hora, só módulos embutidos) vs build de desenvolvimento (qualquer módulo, exige conta paga para distribuir).
**Rationale:** NFR-009 e uma dev só. Os módulos embutidos cobrem 100% dos Must.
**Accepted:** Benefício: R$ 0 e ciclo rápido / Custo: sem widget, sem Live Activity, dependência do calendário de versões do Expo Go / Mitigação: a regra "nada fora da lista" mantém a porta para o build próprio aberta.
**Revisit when:** validação aprovada.

### Trade-off: Drizzle sobre SQLite em vez de SQL cru ou de armazenamento chave-valor
**Decision:** Drizzle (ADR-002).
**Options:** chave-valor (simples, sem consultas nem transação) vs SQL cru (sem dependência, sem tipos) vs Drizzle (tipos, migrações, consultas reativas, ~30 KB).
**Rationale:** NFR-004 pede transação; a dona é forte em TypeScript; consultas reativas simplificam a ADR-004.
**Accepted:** Benefício: menos bugs de dado / Custo: aprender drizzle-kit / Mitigação: schema pequeno (8 tabelas).
**Revisit when:** sincronização entrar.

### Trade-off: Sheets nativas em vez de desenhadas à mão
**Decision:** `formSheet` nativo (ADR-007).
**Options:** nativa (aparência e acessibilidade do iOS de graça, menos controle) vs JS (controle total, mais código, menos "Apple").
**Rationale:** "estilo Apple" é literalmente o componente da Apple; menos código para uma dev só.
**Accepted:** Benefício: comportamento perfeito / Custo: raio e afastamento podem diferir do canvas / Mitigação: o canvas vira referência de conteúdo, não de pixel.
**Revisit when:** uma sheet precisar de interação que a nativa não ofereça.

### Trade-off: Virada do dia às 4h
**Decision:** 4h no fuso do aparelho (ADR-008).
**Options:** meia-noite (intuitivo para máquina) vs 4h (respeita quem trabalha tarde).
**Rationale:** público com TDAH costuma produzir à noite; um bloco à 0h30 "não ter contado" seria uma punição falsa.
**Accepted:** Custo: regra a explicar se alguém perguntar / Mitigação: nenhuma tela mostra a hora da virada.
**Revisit when:** testadoras estranharem.

---

## 10. Deployment Architecture

### Environments
- **Development:** `npx expo start` no computador + Expo Go no iPhone da dona, mesma conta Expo.
- **Teste (validação):** atualização publicada por EAS Update num canal `validacao`; testadoras como membros da organização Expo abrem no Expo Go (ADR-011, opção A).
- **Production:** não existe na v1. Ao aprovar a validação: EAS Build + App Store.

### Topology
Nenhum servidor próprio. Cada iPhone tem o app (dentro do Expo Go) e o próprio `rumo.db`. O único serviço externo é o EAS Update, que só entrega o JavaScript do app; dados da pessoa nunca passam por ele.

### Strategy
- **Deployment method:** publicação de atualização JavaScript por canal (EAS Update).
- **Rollback:** republicar a atualização anterior no canal (`eas update:republish`).
- **Migrações:** só para frente; cada versão do schema tem teste a partir da anterior; nunca apagar coluna durante a validação.
- **Scaling:** não se aplica (sem servidor). Limite prático: membros da organização Expo e o plano gratuito do EAS Update (folga ampla para 20 pessoas).

---

## 11. Future Considerations

**Anticipated changes:**
- *Curto prazo:* receitas de código, estudo e texto; importação do JSON exportado.
- *Médio prazo (validação aprovada):* build próprio, App Store, Live Activity do timer, widget do Hoje, Sign in with Apple.
- *Longo prazo:* sincronização local-first sobre o mesmo SQLite (IDs UUID e `updated_at` em todas as tabelas já preparam isso); receitas geradas por IA no mesmo formato da ADR-009.

**Scalability path:** 1 aparelho por pessoa, sem servidor → com sincronização, um backend mínimo (ex.: Postgres gerenciado com camada de sync) que só replica tabelas; domínio e telas não mudam.

**Revisit triggers (aggregated from ADRs):**
- Spike da opção A da ADR-011 concluído (sucesso ou falha).
- Validação aprovada → sair do Expo Go (ADR-001, ADR-008, ADR-010).
- Pedido de backup/sincronização pelas testadoras (ADR-002, ADR-003).
- Receitas insuficientes para os objetivos reais (ADR-009).
- Mais de ~10 telas (ADR-010).

---

## Spike técnico (antes da primeira história)

Prova de 1 a 2 dias, num app vazio criado com o SDK do Expo Go da loja:
1. Abrir `rumo.db` com Drizzle, rodar uma migração, gravar e ler de volta após matar o app.
2. Agendar um lembrete diário e uma notificação para daqui a 2 minutos; fechar o app; ambos chegam.
3. Timer de 25 min por carimbos: pausar, fechar o app, reabrir, conferir ±1 s.
4. Abrir uma sheet nativa (`formSheet`) com alça e fechar arrastando.
5. **Opção A da ADR-011:** publicar por EAS Update e abrir no Expo Go de uma segunda pessoa adicionada à organização.

Saída: uma linha por item no `decision-log.md` (passou / não passou / ajuste).

---

## Appendix

### Glossary
| Term | Definition |
|------|------------|
| Expo Go | App da App Store que roda projetos Expo sem build próprio |
| EAS Update | Serviço da Expo que publica o JavaScript do app para quem já o abre |
| Drizzle | ORM TypeScript leve com schema tipado e migrações |
| WAL | Modo de diário do SQLite que torna a gravação segura e rápida |
| data_dia | Dia do calendário com virada às 4h no fuso do aparelho |
| Caso de uso | Função em `src/features` que executa uma ação completa da pessoa |

### References
- PRD: `bmad-output/prd.md`
- UX: `bmad-output/DESIGN.md`, `bmad-output/EXPERIENCE.md`
- Decisões: `bmad-output/decision-log.md`
- Expo: docs.expo.dev (SDK, notifications, expo-sqlite, EAS Update)
