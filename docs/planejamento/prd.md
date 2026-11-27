# PRD: Rumo — termine suas tracks

**Versão:** 3.0 · **Data:** 27/11/2026 · **Autora:** Thayana (com Claude) · **Track:** Quick Flow
**Substitui:** PRD v2 (retomar curso online), guardado em `prd-v2.md`.
**Base de conhecimento:** documento "Rumo: base de conhecimento de produção (house, deep house, garage)".

---

## Mudanças desde a v2

| Antes (v2) | Agora (v3) | Motivo |
|---|---|---|
| Retomar curso online ou certificação | Finalizar tracks de música eletrônica | Decisão da dona em 27/11 |
| Meta de renda extra, compra única | Projeto pessoal e de portfólio, sem cobrança | A dona é a primeira usuária |
| Sumário colado ou link do Microsoft Learn | Trilha gerada de uma base de conhecimento de produção | Quebra macro e micro sem IA |
| Tópicos de um curso | 8 fases e tarefas de 25 minutos | O ciclo de uma track |
| Estética de planner claro | Estética de estúdio, inspirada no Ableton; mascote Knob | Nicho de produtores |

O que continua: tudo local e sem conta, bloco de foco, onde parei, retomada sem culpa, progresso que nunca zera, versão por link.

## Resumo

O Rumo ajuda produtoras e produtores de house, deep house e UK garage a terminar as tracks que começam. Ele quebra a track em 8 fases (ideia, loop, arranjo, vida, automação, mix, master, export) e cada fase em tarefas que cabem num bloco de 25 minutos, a partir de uma base de conhecimento guardada no app, sem IA. O app vai fundo onde a dona trava: sair do loop para o arranjo e dar vida com automações. A track está terminada quando existe um WAV exportado com mix e master básicas.

## Objetivos

| ID | Objetivo | Como medir |
|---|---|---|
| G1 | Terminar tracks | A dona exporta a 1ª track em até 30 dias de uso; 3 tracks em 90 dias |
| G2 | Voltar depois de sumir | Depois de 3+ dias sem bloco, a dona volta e faz um bloco em 80% das vezes |
| G3 | Portfólio | Código público, PRs pequenos seguindo o GITFLOW, release `v0.1.0` com a primeira track terminada |

**Não-objetivos:** renda, contas e sincronização, lançamento e divulgação, outros estilos além dos três.

## Usuária

Thayana, produtora de house no Ableton Live, desenvolvedora frontend, 1h por dia. Trava ao sair do loop de 8 compassos para o arranjo e, depois, nas automações. Usa o iPhone longe do computador para decidir o que fazer na próxima sessão.

---

## Requisitos funcionais

IDs da v2 que continuam mantêm o número. IDs novos começam em FR-022.

### FR-022: Criar uma track — MUST
Nome, estilo (house, deep house, UK garage), BPM (sugerido pelo estilo), tom (opcional), destino (pista ou streaming).
- Dado o estilo escolhido, o BPM vem preenchido com o valor de partida da base (ex.: house 124).
- Criar a track leva no máximo 2 telas e 60 segundos.

### FR-023: Trilha gerada da base de conhecimento — MUST
Ao criar a track, o app monta as 8 fases e as tarefas da base, filtradas pelo estilo.
- Cada tarefa tem texto, "pronto quando" e versão feia de 10 minutos.
- A trilha é a mesma para as mesmas escolhas (sem sorteio, sem IA).

### FR-024: Dizer onde a track está — MUST (substitui FR-018)
A pessoa escolhe a fase atual; as fases anteriores ficam marcadas como feitas.
- Uma track nova pode começar em qualquer fase (ex.: "já tenho o loop").
- A porcentagem aparece na hora.

### FR-004: Hoje mostra a próxima tarefa — MUST
Fase atual, a tarefa, o "pronto quando", o onde parei (se houver) e o progresso da track.
- Botões: começar 25 min e "só 10 min · versão feia".

### FR-029: Versão feia — MUST
"Só 10 min" abre o bloco curto e mostra a versão feia da tarefa no lugar do texto normal.

### FR-006: Foco com timer — MUST (já implementado)
Timer por carimbos, pausar, seta de voltar, sair sem contar.

### FR-008: Fechamento do bloco — MUST (já implementado)
"Terminei a tarefa" ou "ainda não", com onde parei de uma linha.

### FR-027: Mapa de arranjo e locators — MUST
Na fase de arranjo, o app mostra o mapa do estilo em compassos, com o compasso de início de cada seção e o tempo em minutos pelo BPM.
- Ex.: house 124 BPM → INTRO 1, GROOVE 33, BUILD 49, DROP 65… total ≈ 6 min.
- A pessoa ajusta o tamanho de cada seção; o tempo total recalcula.

### FR-026: Cardápio de automação — MUST
Na fase de automação, o app lista as automações da base por seção; a pessoa escolhe de 3 a 6, e cada escolha vira uma tarefa.

### FR-011: Voltar depois de sumir — MUST
Com 3+ dias sem bloco (dia vira às 4h), o Hoje mostra o onde parei e o passo de volta de 10 minutos da fase atual. Nunca mostra os dias perdidos.

### FR-013: Progresso da track — MUST
Uma linha do tempo das 8 fases, como uma timeline de clips: feitas, atual e por vir. O progresso nunca diminui.

### FR-025: Editar a trilha — SHOULD
Pular uma tarefa, editar o texto, acrescentar uma tarefa numa fase.

### FR-030: Várias tracks, uma ativa — SHOULD
Lista de tracks com a fase de cada uma; trocar a ativa arquiva a anterior, sem apagar.

### FR-016: Ajustes — SHOULD
Tema (estúdio escuro como padrão), duração do bloco, horário do lembrete, exportar dados.

### FR-010: Lembrete diário — SHOULD
Pedido depois do primeiro bloco; só no app instalado (a web não agenda sem servidor).

### FR-028: Ler o projeto do Ableton (.als) — COULD (v2)
A pessoa compartilha o `.als`; o app lê no aparelho BPM, faixas, locators, tamanho do arranjo e quantas automações existem, e sugere a fase e a próxima tarefa. Só leitura; nada sai do aparelho.

### Fora desta versão (Won't)
FR-001, FR-002 e FR-018 (curso e sumário, substituídos); FR-005 (tamanho do dia), FR-007 (travou), FR-012 (semana), FR-014 (pra depois), FR-015 (celebração), FR-017 (contar pra alguém), FR-019 a FR-021 (compra e data de prova). Podem voltar depois da primeira track terminada.

---

## Requisitos não funcionais

| ID | Requisito | Medida |
|---|---|---|
| NFR-001 | Abertura | Hoje em ≤ 1 s (quente) |
| NFR-002 | Resposta ao toque | ≤ 100 ms |
| NFR-003 | Precisão do timer | ±1 s, por carimbos |
| NFR-004 | Nenhum dado perdido | Toda ação gravada antes da tela mudar |
| NFR-005 | Privacidade | Nada sai do aparelho; o `.als` é lido localmente |
| NFR-006 | Acessibilidade | WCAG AA no tema escuro e no claro, VoiceOver, Dynamic Type |
| NFR-007 | Começo rápido | Da abertura à primeira tarefa em ≤ 60 s |
| NFR-008 | Base de conhecimento validada | Teste de schema: toda tarefa tem texto, pronto quando, versão feia e estilos; nada fica em código de tela |
| NFR-009 | Custo zero | Expo Go, versão web no GitHub Pages, sem servidor |

## Épicos

| Épico | Entrega | Requisitos |
|---|---|---|
| EPIC-A Base e domínio | Base de conhecimento como dados validados; modelo track → fase → tarefa | FR-023, NFR-008 |
| EPIC-B Começar uma track | Criar track e dizer onde ela está | FR-022, FR-024, NFR-007 |
| EPIC-C Sessão | Hoje, versão feia, Foco e fechamento sobre tarefas | FR-004, FR-029, FR-006, FR-008 |
| EPIC-D Arranjo e automação | Mapa de locators e cardápio de automação | FR-027, FR-026 |
| EPIC-E Voltar e progresso | Retomada por fase e timeline das fases | FR-011, FR-013 |
| EPIC-F Estética de estúdio | Tema escuro inspirado no Ableton, Knob, cor por fase | NFR-006 |
| EPIC-G Ableton v2 | Leitura do `.als` | FR-028 |

**Ordem sugerida:** A → B → C → D → E → F, com F podendo andar junto de B. G depois da primeira track terminada.

## Riscos

| Risco | Mitigação |
|---|---|
| Construir o app virar a forma de não terminar músicas | Métrica G1 manda: a v0.1 só precisa ser boa para terminar uma track; release `v0.1.0` = track exportada |
| Base de conhecimento genérica demais | A dona revisa a base; cada tarefa nasce de uma etapa do guia dela |
| Estética copiar o Ableton | Inspiração no espírito (cinzas, blocos, cor por clip), sem logo, nome ou interface idênticos |
| `.als` mudar de formato entre versões do Live | Fica para a v2, com teste em arquivos reais da dona |
