# Product Requirements Document (PRD)

**Project Name:** Rumo
**Version:** 2.0
**Date:** 24/11/2026
**Author:** Thayana (produto) · redigido com Claude (PM)
**Status:** Rascunho para validação
**Track:** Quick Flow

> Fonte da verdade sobre *o quê* e *por quê*. Não prescreve *como* (isso é da arquitetura).
> A v1 (um objetivo qualquer em 12 semanas) está guardada em `prd-v1.md`. Decisões ficam em `decision-log.md`.

---

## Mudanças desde a v1

| O que mudou | Por quê |
|---|---|
| O público passa a ser **quem começou um curso online ou uma certificação e largou** | A dor mais citada nas conversas foi "comecei e larguei"; estudo é o caso mais estruturado e mais fácil de vender |
| A quebra deixa de vir de receitas: a pessoa **cola o sumário do curso** e cada linha vira um tópico | Estudo já vem quebrado; resolve a fraqueza de receitas genéricas sem precisar de IA |
| Novo momento de valor: **"até onde você foi"** mostra a porcentagem já feita | A pessoa vê que não está começando do zero; é o motivo para voltar |
| Saem as 3 paradas fixas (semanas 3, 7 e 12) | Os módulos do sumário fazem esse papel |
| Porcentagem de **conteúdo** passa a aparecer | Mede o que existe (tópicos feitos), não esforço; sequência de dias e horas acumuladas continuam proibidas |
| **Monetização:** grátis para 1 estudo; pagamento único (R$ 59) libera o resto | Sem assinatura: quem tem TDAH esquece de cancelar, e isso vira argumento de venda |

---

## Executive Summary

**Problem Statement:** Adultos com TDAH, ou que só têm dificuldade de terminar o que começam, compram um curso online ou começam a estudar para uma certificação e param no meio. Quando pensam em voltar, não lembram onde pararam, sentem que vão ter que recomeçar e desistem de novo. Apps de tarefas e planners organizam o dia, mas não guardam o progresso de um curso nem tornam a volta pequena.

**Proposed Solution:** Um app iOS em que a pessoa cola o sumário do curso, marca até onde foi e vê quanto já fez. Todo dia o app mostra um tópico só, com um bloco de foco de 25 minutos (ou 10 e 2 minutos nos dias ruins), e guarda onde ela parou. Quando ela some, o app a recebe com o ponto exato e uma volta de 10 minutos.

**Business Value:** Gerar renda extra com pagamento único, num nicho sem concorrente forte em português. Meta: R$ 3.000 por mês, o que equivale a cerca de 60 vendas por mês a R$ 59.

**Target Outcome:** Na validação, provar duas coisas antes de construir a parte paga: que as pessoas voltam a estudar com o app (retenção) e que uma parte delas paga (intenção de compra).

---

## Project Overview

### Background
A v1 tratava qualquer objetivo de 12 semanas. Uma análise crítica apontou cinco fraquezas: nenhum sinal de que alguém pagaria, quebra por receita genérica que perde para o ChatGPT gratuito, meta de receita incompatível com o tempo disponível, assinatura contra um produto que termina e público amplo demais. A v2 responde estreitando o público (estudo e carreira), trocando receitas por sumário colado e assinatura por pagamento único.

### Current State → Desired State
- **Current:** a pessoa tem um curso parado na plataforma, uma lista no Notion ou nada. Quando pensa em voltar, abre o curso, não lembra onde estava e desiste.
- **Desired:** a pessoa abre o Rumo, vê "você já fez 42%", o próximo tópico e a nota de onde parou, e estuda 10 a 25 minutos. Quando some, volta com uma revisão curta.

### Stakeholders
| Stakeholder | Role | Interest | Influence |
|-------------|------|----------|-----------|
| Thayana | Dona do produto, desenvolvedora, primeira usuária | Renda extra; terminar os próprios estudos | Alta |
| Pessoas que largaram um curso ou certificação (10 a 20 na validação) | Usuárias e compradoras | Terminar o curso sem recomeçar do zero | Média |

---

## Goals and Objectives

### Business Goals
1. **G1 · Ativação:** a pessoa importa o sumário, marca até onde foi e faz o primeiro bloco no mesmo dia.
2. **G2 · Retenção:** a pessoa continua estudando na semana 2 e volta depois de sumir.
3. **G3 · Valor percebido:** a porcentagem do curso sobe toda semana e a pessoa sente que está terminando.
4. **G4 · Receita:** uma parte das pessoas ativas paga o pagamento único; meta de médio prazo de cerca de 60 vendas por mês.

### User Goals
1. Saber onde parei sem reabrir o curso inteiro.
2. Ver que não estou começando do zero.
3. Saber o que estudar hoje sem decidir.
4. Ter uma versão possível nos dias ruins e voltar sem vergonha depois de sumir.
5. Chegar na prova no ritmo certo (quando houver data).

---

## Functional Requirements

> Formato: `FR-###: PRIORIDADE — capacidade`. IDs da v1 mantidos quando o propósito é o mesmo; novos começam em FR-018.

### FR-001: Registrar o estudo que ficou pela metade — MUST
**Description:** A pessoa diz que tipo de estudo é e dá um nome, sem criar conta.
**Acceptance Criteria:**
- Given a primeira abertura, when toca em "Começar", then a tela abre sem pedir login.
- Oferece 4 tipos: certificação, curso online, idioma e outro estudo.
- O nome é obrigatório, com até 60 caracteres.
- A data da prova é opcional e pode ser definida depois.
**Related Epic:** EPIC-001

---

### FR-002: Importar o sumário como tópicos — MUST
**Description:** A pessoa cola o sumário do curso e cada linha vira um tópico; linhas de módulo viram grupos.
**Acceptance Criteria:**
- Aceita texto colado de até 300 linhas; linhas vazias e numeração inicial ("1.", "1.2 -", "•") são removidas.
- Linhas que começam com "Módulo", "Unidade", "Seção", "Capítulo" ou "Domínio" viram grupos; as demais viram tópicos do grupo anterior.
- Sem nenhuma linha de grupo, todos os tópicos ficam num grupo único com o nome do estudo.
- Antes de continuar, mostra o resumo "N tópicos em M módulos" e permite editar, apagar e reordenar.
- Existe a alternativa "Não tenho o sumário · digitar os tópicos", com um tópico por linha.
**Related Epic:** EPIC-001

---

### FR-018: Marcar até onde foi — MUST
**Description:** A pessoa toca no último tópico que concluiu e tudo antes dele fica marcado como feito.
**Acceptance Criteria:**
- A lista mostra os módulos; os já concluídos aparecem recolhidos com "N de N".
- Tocar num tópico marca ele e todos os anteriores como feitos e o identifica como "último feito".
- Mostra na hora a porcentagem feita, com a frase "Você não está começando do zero" (ou "Vamos começar" se for 0%).
- A marcação pode ser corrigida depois no Progresso.
**Related Epic:** EPIC-001

---

### FR-003: Primeiro bloco direto do começo — MUST
**Description:** Ao terminar o começo, a pessoa pode estudar na hora.
**Acceptance Criteria:**
- O botão "Voltar a estudar · 25 min" abre o Foco no primeiro tópico não feito.
- Do primeiro toque no app até o Foco rodando, são no máximo 4 telas e 1 colagem.
**Related Epic:** EPIC-001

---

### FR-004: Hoje mostra um tópico — MUST
**Description:** A tela principal mostra só o próximo tópico, o módulo e a porcentagem do curso.
**Acceptance Criteria:**
- Mostra exatamente um tópico, o rótulo "Módulo X · tópico N de M" e a mini-trilha do módulo atual.
- Mostra "N% do curso · ver progresso", que abre o Progresso.
- Mostra quanto falta para fechar o módulo ("Faltam 4 pra fechar Segurança").
- Toda abertura cai no Hoje, exceto durante um bloco em andamento (reabre o Foco).
**Related Epic:** EPIC-002

---

### FR-005: Tamanho do dia — MUST
**Description:** A pessoa reduz o dia para um tamanho possível, e todo tamanho conta.
**Acceptance Criteria:**
- "Hoje tá difícil" abre a escolha em 1 toque: dia difícil (10 min, revisar o último tópico) ou dia impossível (2 min, só abrir o material).
- O tamanho normal é o padrão e não precisa ser escolhido.
- Qualquer tamanho conta como dia estudado.
**Related Epic:** EPIC-002

---

### FR-006: Foco com timer — MUST
**Description:** Um bloco de foco com contagem regressiva.
**Acceptance Criteria:**
- Mostra o tópico, o tempo restante e "Módulo · tópico N de M".
- Botões: Terminei, Anotar, Pausar, Travei.
- O tempo continua certo com o app em segundo plano ou fechado, e uma notificação local avisa o fim.
**Related Epic:** EPIC-002

---

### FR-007: Travou — SHOULD
**Description:** Quando a pessoa não consegue começar, o app oferece uma entrada menor.
**Acceptance Criteria:**
- "Travei" sugere 5 minutos lendo só o resumo do tópico, que vira o bloco atual.
- "Hoje não vai rolar" encerra o dia; conta como dia impossível se ela ficou ao menos 1 minuto no Foco.
**Related Epic:** EPIC-002

---

### FR-008: Fechamento do bloco — MUST
**Description:** No fim do bloco, uma pergunta registra o que aconteceu com o tópico.
**Acceptance Criteria:**
- "E o tópico?" com 3 respostas: Terminei o tópico, Ainda continua, Só revisei.
- "Terminei" mostra a porcentagem nova no próprio botão ("sobe pra 42%").
- "Ainda continua" oferece o campo "onde você parou?" (até 120 caracteres).
- "Só revisei" conta o dia e mantém o tópico.
- A resposta pode ser desfeita até o próximo bloco.
**Related Epic:** EPIC-002

---

### FR-009: Progresso visível — MUST
**Description:** Concluir um tópico mostra o curso andando.
**Acceptance Criteria:**
- Ao "Terminei", a mini-trilha avança e o Hoje passa a "Hoje já contou", com "Você foi de X% pra Y%" e o próximo tópico de amanhã.
- A porcentagem é sempre de tópicos feitos sobre o total. Nenhuma tela mostra horas acumuladas ou sequência de dias.
**Related Epic:** EPIC-002

---

### FR-010: Lembrete diário pedido no momento certo — MUST
**Description:** O app pede permissão depois que a pessoa já estudou.
**Acceptance Criteria:**
- O pedido aparece em "Hoje já contou", após o primeiro bloco: "Amanhã às [hora] te chamo pro próximo tópico?".
- Aceito, agenda uma notificação local diária, editável em Ajustes. Recusado, não pede de novo.
**Related Epic:** EPIC-002

---

### FR-011: Voltar depois de sumir — MUST
**Description:** Depois de dias sem estudar, o Hoje recebe a pessoa com o ponto onde parou e uma volta curta.
**Acceptance Criteria:**
- Com 2 ou mais dias sem bloco: "Que bom te ver. Faz N dias, e seus X% continuam aqui", o tópico atual e a nota de onde parou.
- O botão principal vira "Revisar e voltar · 10 min"; o tamanho normal fica como opção.
- Se houver data de prova, o ritmo semanal é recalculado em silêncio (ver FR-019).
- O texto nunca fala em falha, atraso ou sequência perdida.
**Related Epic:** EPIC-003

---

### FR-012: Revisão da semana — SHOULD
**Description:** No primeiro acesso da semana, um resumo curto.
**Acceptance Criteria:**
- Mostra tópicos concluídos na semana e o próximo tópico.
- Com data de prova, mostra "Faltam N tópicos e S semanas: R por semana".
- Mostra quantos itens há em Pra depois.
- Cabe numa sheet sem rolagem no iPhone de 6,1 polegadas.
**Related Epic:** EPIC-003

---

### FR-013: Progresso — MUST
**Description:** Uma tela mostra o curso inteiro.
**Acceptance Criteria:**
- Mostra a porcentagem geral, "N de M tópicos" e, com data de prova, se o ritmo atual chega a tempo.
- Lista os módulos com barra e "feitos de total"; o módulo atual mostra seus tópicos (feitos riscados, o atual destacado).
- Permite editar, reordenar e marcar ou desmarcar tópicos.
- Lista "Outros estudos" e o atalho "Adicionar estudo".
**Related Epic:** EPIC-004

---

### FR-014: Pra depois — SHOULD
**Description:** Tirar da cabeça o que aparece durante o estudo.
**Acceptance Criteria:**
- "Anotar" no Hoje e no Foco captura em até 2 toques, sem sair do bloco.
- Os itens aparecem só na revisão da semana e no Progresso.
**Related Epic:** EPIC-004

---

### FR-015: Celebração de módulo e de conclusão — SHOULD
**Description:** Fechar um módulo ou o curso mostra o que foi conquistado.
**Acceptance Criteria:**
- Concluir o último tópico de um módulo mostra "Módulo N de M · [nome]: feito", a porcentagem e quantas vezes a pessoa voltou.
- Concluir o curso mostra a conclusão e oferece retomar outro estudo.
**Related Epic:** EPIC-003

---

### FR-016: Ajustes — SHOULD
**Description:** O mínimo que a pessoa precisa mudar.
**Acceptance Criteria:**
- Tema, duração do bloco (15, 25 ou 45 min), horário do lembrete, Rumo completo, exportar dados e trocar de estudo.
- Trocar de estudo guarda o atual como pausado, sem apagar.
**Related Epic:** EPIC-004

---

### FR-017: Contar pra alguém — COULD
**Description:** Compartilhar o resumo da semana.
**Acceptance Criteria:**
- A revisão da semana e a celebração abrem a folha de compartilhamento do iOS com texto pronto (estudo, porcentagem, tópicos da semana).
**Related Epic:** EPIC-003

---

### FR-019: Data de prova e ritmo — SHOULD (Rumo completo)
**Description:** Com uma data, o app calcula quantos tópicos por semana são necessários.
**Acceptance Criteria:**
- Ritmo = tópicos restantes ÷ semanas restantes, arredondado para cima.
- O ritmo é recalculado a cada tópico concluído e ao voltar depois de sumir, sem pedir decisão.
- Se o ritmo passar de 2× o ritmo médio das últimas 2 semanas, o Progresso diz "Nesse ritmo fica apertado" e oferece mudar a data, sem tom de cobrança.
**Related Epic:** EPIC-005

---

### FR-020: Rumo completo (pagamento único) — MUST para venda, fora da validação técnica
**Description:** O app é grátis para 1 estudo; uma compra única libera o resto.
**Acceptance Criteria:**
- Grátis: 1 estudo ativo, com todas as funções de FR-001 a FR-018, exceto FR-019 e a exportação.
- Pago, por R$ 59 uma única vez: estudos sem limite, data de prova com ritmo (FR-019) e exportação de dados.
- A oferta aparece em dois lugares: ao tocar em "Adicionar estudo" e em Ajustes. Nunca no Hoje nem durante um bloco.
- A sheet de oferta tem "Destravar por R$ 59 · uma vez só", "Sem assinatura. É seu pra sempre", "Agora não" e "Restaurar compra".
- A compra é reconhecida em até 5 s e sobrevive a reinstalar o app (via restaurar).
**Related Epic:** EPIC-005

---

### FR-021: Vários estudos, um ativo — SHOULD (Rumo completo)
**Description:** A pessoa guarda outros estudos sem perder o foco.
**Acceptance Criteria:**
- Só um estudo é ativo por vez; os outros aparecem em "Outros estudos" com "parado em [último tópico]".
- Trocar o ativo leva 2 toques a partir do Progresso.
**Related Epic:** EPIC-005

---

## Non-Functional Requirements

### NFR-001: Abertura até o Hoje — MUST (Performance)
**Acceptance / Threshold:** Hoje interativo em até 1,0 s com o app em segundo plano e 2,0 s a frio, num iPhone 12.
**Measurement Method:** 10 aberturas de cada tipo, com o perfilador do Xcode.

### NFR-002: Resposta ao toque — MUST (Performance)
**Acceptance / Threshold:** retorno visual em até 100 ms; menos de 5% de quadros perdidos nas transições.
**Measurement Method:** gravação a 120 fps nas 5 transições principais.

### NFR-003: Precisão do timer — MUST (Reliability)
**Acceptance / Threshold:** erro de até 1 s após 25 min em segundo plano; notificação em até 5 s do horário.
**Measurement Method:** 10 blocos em segundo plano e 10 com o app encerrado.

### NFR-004: Nenhum dado perdido — MUST (Reliability)
**Acceptance / Threshold:** 0 ações perdidas após fechamento forçado; importação de sumário é atômica (tudo ou nada).
**Measurement Method:** encerrar à força após cada uma das 8 ações principais e após colar um sumário de 300 linhas.

### NFR-005: Privacidade local — MUST (Security)
**Acceptance / Threshold:** dados de estudo ficam só no aparelho; as únicas chamadas de rede são as da loja da Apple para a compra.
**Measurement Method:** inspeção de tráfego com proxy numa sessão completa.

### NFR-006: Acessibilidade — MUST (Usability)
**Acceptance / Threshold:** contraste de 4,5:1 para texto e 3:1 para gráficos; alvos de 44 pt; 100% dos controles com rótulo no VoiceOver; texto até AX3 sem corte; "reduzir movimento" e "reduzir transparência" respeitados.
**Measurement Method:** Accessibility Inspector e passagem manual com VoiceOver.

### NFR-007: Começo rápido — MUST (Usability)
**Acceptance / Threshold:** mediana de até 3 minutos do primeiro toque ao primeiro bloco, incluindo colar o sumário; ações diárias em até 2 toques a partir do Hoje.
**Measurement Method:** teste cronometrado com 5 pessoas do público, sem ajuda.

### NFR-008: Importação tolerante — SHOULD (Maintainability)
**Acceptance / Threshold:** sumários copiados de 5 plataformas de curso diferentes (por exemplo Udemy, Alura, Coursera, edital ou guia oficial de certificação e um PDF) geram grupos e tópicos corretos em pelo menos 90% das linhas, sem edição manual. As regras ficam em dados e testes, não espalhadas nas telas.
**Measurement Method:** suíte de 5 sumários reais com resultado esperado.

### NFR-009: Custo da validação — MUST (Operability)
**Acceptance / Threshold:** R$ 0 na validação de uso (Expo Go). A venda exige a conta paga da Apple (US$ 99/ano), aceita pela dona; nenhum outro custo fixo.
**Measurement Method:** conferência de contas e serviços ao fim de cada fase.

---

## Epics and User Stories (Outline)

### EPIC-001: Começar de onde parou
**Business Value:** leva ao momento "você já fez 38%" e ao primeiro bloco no mesmo dia (G1).
**Related Requirements:** FR-001, FR-002, FR-018, FR-003, NFR-007, NFR-008
- **STORY-001:** Como pessoa que largou um curso, quero dar nome e tipo ao estudo, para registrá-lo sem criar conta.
  - Given a primeira abertura, when escolho "Certificação" e digito o nome, then sigo para colar o sumário.
- **STORY-002:** Como pessoa que largou um curso, quero colar o sumário, para não digitar tópico por tópico.
  - Given o sumário copiado da plataforma, when colo, then vejo "24 tópicos em 4 módulos".
- **STORY-015:** Como pessoa que largou um curso, quero tocar no último tópico que fiz, para ver que não começo do zero.
  - Given a lista importada, when toco em "IAM: usuários e grupos", then os anteriores ficam feitos e vejo "38% já feito".
- **STORY-003:** Como pessoa animada para voltar, quero estudar na hora, para aproveitar o impulso.
  - Given a marcação feita, when toco em "Voltar a estudar", then o Foco abre no próximo tópico.

### EPIC-002: O dia de estudo
**Business Value:** transforma cada sessão em porcentagem que sobe (G2, G3).
**Related Requirements:** FR-004 a FR-010
- **STORY-004:** Como estudante, quero ver só o tópico de hoje, para não decidir.
- **STORY-005:** Como estudante num dia ruim, quero estudar 10 ou 2 minutos e que conte, para não zerar.
- **STORY-006:** Como estudante travada, quero uma entrada de 5 minutos, para conseguir começar.
- **STORY-007:** Como estudante no fim do bloco, quero dizer em um toque o que aconteceu, e guardar onde parei.
- **STORY-008:** Como estudante que terminou um tópico, quero ver a porcentagem subir.
- **STORY-009:** Como estudante que esquece, quero um lembrete no horário em que costumo estudar.

### EPIC-003: Voltar e ver o resultado
**Business Value:** mantém a pessoa estudando depois de sumir (G2).
**Related Requirements:** FR-011, FR-012, FR-015, FR-017
- **STORY-010:** Como estudante que sumiu 6 dias, quero ver onde parei e revisar 10 minutos, para voltar sem vergonha.
- **STORY-011:** Como estudante com prova marcada, quero ver na revisão da semana quantos tópicos por semana preciso.
- **STORY-012:** Como estudante que fechou um módulo, quero ver o que conquistei.

### EPIC-004: Progresso e ajustes
**Business Value:** visão do curso inteiro e controle mínimo (G3).
**Related Requirements:** FR-013, FR-014, FR-016
- **STORY-013:** Como estudante, quero ver todos os módulos e o que falta, para saber que estou terminando.
- **STORY-014:** Como estudante com mil ideias, quero anotar sem sair do bloco.

### EPIC-005: Rumo completo
**Business Value:** receita por pagamento único (G4).
**Related Requirements:** FR-019, FR-020, FR-021
- **STORY-016:** Como estudante com mais de um curso parado, quero destravar estudos ilimitados com um pagamento só, para não ter mais uma assinatura.
  - Given 1 estudo ativo, when toco em "Adicionar estudo", then vejo a oferta e, ao pagar, consigo adicionar o segundo.
- **STORY-017:** Como estudante com prova marcada, quero o ritmo semanal calculado, para chegar a tempo.
- **STORY-018:** Como estudante que trocou de celular, quero restaurar a compra.

---

## Prioritization Summary (MoSCoW)

| Priority | Requirements | Rationale |
|----------|--------------|-----------|
| Must | FR-001, FR-002, FR-018, FR-003, FR-004, FR-005, FR-006, FR-008, FR-009, FR-010, FR-011, FR-013, FR-020 (para vender) | O ciclo que testa a hipótese: importar, ver o já feito, estudar, ver subir, voltar; e a cobrança que testa a receita |
| Should | FR-007, FR-012, FR-014, FR-015, FR-016, FR-019, FR-021 | Retenção e valor do plano pago |
| Could | FR-017 | Depende de outra pessoa |
| Won't (this release) | IA, questões e simulados, revisão espaçada, sincronização, Android, assinatura | Ver Out of Scope |

---

## Success Metrics

| Metric | Baseline | Target | Measurement Method | Frequency |
|--------|----------|--------|--------------------|-----------|
| Ativação: sumário importado e primeiro bloco em até 24 h | Sem dado | ≥ 60% (parar se < 40%) | Registro local exportado | Fim da validação |
| Momento de valor: chega à tela "até onde você foi" | Sem dado | ≥ 80% de quem começa | Registro local | Fim da validação |
| Retenção dia 14: estudou na semana 2 | Sem dado | ≥ 30% (parar se < 15%) | Registro local | Semanal |
| Retorno: de quem sumiu 2+ dias, quantos voltaram | Sem dado | ≥ 50% | Registro local | Semanal |
| Valor: tópicos por pessoa ativa por semana | Sem dado | ≥ 3 | Registro local | Semanal |
| Intenção de compra: pré-venda ou "quero comprar" fora do app | Sem dado | ≥ 20% das pessoas ativas na semana 2 | Link de pré-venda ou formulário | Fim da validação |
| Receita (após lançamento) | 0 | ≈ 60 vendas/mês (R$ 3.000) | App Store Connect | Mensal |

---

## Assumptions and Dependencies

### Assumptions
1. A maioria dos cursos e certificações tem um sumário copiável (plataforma, guia oficial do exame ou PDF).
2. Ver a porcentagem já feita aumenta a vontade de voltar.
3. Tópicos de curso cabem em 1 a 3 blocos; os muito grandes podem ser divididos pela própria pessoa.
4. Pagamento único a R$ 59 é aceitável para o público.

### Dependencies
| Dependency | Type | Owner | Status | Risk | Mitigation |
|------------|------|-------|--------|------|------------|
| Compra dentro do app | Técnica / custo | Thayana | Pendente | Compras da Apple exigem conta paga (US$ 99/ano) e um build próprio; não rodam no Expo Go | Validar uso no Expo Go e intenção de compra por pré-venda fora do app; implementar a compra só depois |
| Sumários reais para testar a importação | Conteúdo | Thayana | A coletar | Importação errada derruba o momento de valor | Juntar 5 sumários de plataformas diferentes antes do código (NFR-008) |
| Testadoras do público | Pessoas | Thayana | A recrutar | Menos de 10 pessoas | Comunidades de TDAH, de certificação e de cursos online |

---

## Constraints

- **Technical:** iOS (React Native com Expo e TypeScript); dados só no aparelho; notificações locais; sem IA e sem backend na v2.
- **Business:** 1 hora por dia de desenvolvimento; pagamento único; R$ 0 até a validação de uso; US$ 99/ano para vender.
- **Timeline:** validação de uso de 2 a 4 semanas; venda só se as metas de retenção e intenção de compra forem atingidas.

---

## Out of Scope

| Excluded | Reason | Revisit? |
|----------|--------|----------|
| Quebra por IA ("me dá um plano para a certificação X") | Custo e servidor; o sumário resolve | Depois da tração, para quem não tem sumário |
| Concursos públicos | Mercado com muitos planos de estudo prontos; foco em curso e certificação | Após validar |
| Questões, simulados e revisão espaçada | Outra categoria de produto | Talvez no plano pago, se pedirem |
| Assinatura | Contra o público e contra um produto que termina | Não |
| Sequência de dias e horas acumuladas | Punição disfarçada de dado | Não |
| Sincronização e conta | Custo e cadastro antes do valor | Após venda |
| Android | Uma plataforma por vez | Após venda |

---

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Sumário colado vem bagunçado | Alto | Média | Regras tolerantes, edição antes de continuar, suíte de 5 sumários reais (NFR-008) | Thayana |
| Ninguém paga R$ 59 | Alto | Média | Pré-venda antes de implementar a compra; testar preço entre R$ 39 e R$ 79 | Thayana |
| Pagamento único exige gente nova todo mês | Alto | Alta | Escolher 1 canal de divulgação durante a validação (comunidade de certificação ou de TDAH) | Thayana |
| Plataformas de curso já mostram progresso | Médio | Alta | O valor está na volta (onde parei, dia pequeno, um tópico por dia) e em juntar cursos de vários lugares, não na barra | Thayana |
| A novidade acaba na semana 2 | Alto | Alta | Lembrete no horário real, revisão semanal, volta de 10 min | Thayana |

---

## Traceability Matrix

| Requirement | Business Goal | Epic | User Story | Status |
|-------------|---------------|------|------------|--------|
| FR-001 | G1 | EPIC-001 | STORY-001 | Proposto |
| FR-002 | G1 | EPIC-001 | STORY-002 | Proposto |
| FR-018 | G1, G3 | EPIC-001 | STORY-015 | Proposto |
| FR-003 | G1 | EPIC-001 | STORY-003 | Proposto |
| FR-004 | G3 | EPIC-002 | STORY-004 | Proposto |
| FR-005 | G2 | EPIC-002 | STORY-005 | Proposto |
| FR-006 | G1, G3 | EPIC-002 | STORY-004 | Proposto |
| FR-007 | G2 | EPIC-002 | STORY-006 | Proposto |
| FR-008 | G3 | EPIC-002 | STORY-007 | Proposto |
| FR-009 | G3 | EPIC-002 | STORY-008 | Proposto |
| FR-010 | G2 | EPIC-002 | STORY-009 | Proposto |
| FR-011 | G2 | EPIC-003 | STORY-010 | Proposto |
| FR-012 | G2 | EPIC-003 | STORY-011 | Proposto |
| FR-013 | G3 | EPIC-004 | STORY-013 | Proposto |
| FR-014 | G2 | EPIC-004 | STORY-014 | Proposto |
| FR-015 | G3 | EPIC-003 | STORY-012 | Proposto |
| FR-016 | G2 | EPIC-004 | — | Proposto |
| FR-017 | G2 | EPIC-003 | — | Proposto |
| FR-019 | G3, G4 | EPIC-005 | STORY-017 | Proposto |
| FR-020 | G4 | EPIC-005 | STORY-016, STORY-018 | Proposto |
| FR-021 | G4 | EPIC-005 | STORY-016 | Proposto |
| NFR-001 a NFR-007 | G1, G2 | (transversal) | — | Proposto |
| NFR-008 | G1 | (transversal) | — | Proposto |
| NFR-009 | G4 | (transversal) | — | Proposto |

---

## Handoff

- **To Architecture (atualização necessária):** a ADR-009 (receitas em JSON) é substituída por um importador de sumário com regras testáveis; nova entidade de grupo/módulo e tópico no lugar de parada/passo; nova ADR para a compra única (biblioteca de compras da Apple em build próprio, fora do Expo Go) e para o limite grátis/pago; NFR-005 passa a permitir as chamadas da loja.
- **Telas:** canvas "Rumo — retomar estudo (v2)": Início, Começar 1 a 3, Hoje (estados), Foco, 6 sheets (dia difícil, travou, fechamento, semana, ajustes, Rumo completo), celebração de módulo e Progresso.
- **Open questions:** preço final (R$ 39 a 79), qual canal de divulgação testar primeiro, quais 5 sumários usar na suíte de importação.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 13/11/2026 | Thayana · Claude | Versão inicial: um objetivo qualquer em 12 semanas |
| 2.0 | 24/11/2026 | Thayana · Claude | Pivô para retomar curso online e certificação; sumário colado no lugar de receitas; "até onde você foi"; pagamento único; FR-018 a FR-021 |
