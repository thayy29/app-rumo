# Decision Log — Rumo

Registro só de acréscimo. Cada entrada: data, decisão, motivo, origem.

## 13/11/2026

- **Track Quick Flow.** 17 requisitos funcionais e 4 epics cabem em menos de 15 histórias. Origem: PM.
- **De 25 telas para 4 telas e 5 sheets.** Telas: Começar (2 passos), Hoje, Foco, Caminho. Sheets: dia difícil, travou, fechamento do bloco, semana, ajustes. O resto vira estado do Hoje. Motivo: cada tela é uma decisão a mais para quem tem TDAH. Origem: conselheiro, aceito.
- **Sem barra de abas.** O Hoje é a única casa; a mini-trilha abre o Caminho. Origem: conselheiro, aceito.
- **Sem tela de boas-vindas nem conta.** O logotipo e a frase vão para o passo 1 do começo. Origem: conselheiro e revisão anterior.
- **Começo em 2 passos.** Passo 1: tipo e o que estará pronto. Passo 2: caminho com as 3 paradas e os passos só da parada 1. O botão final começa o primeiro bloco. Origem: conselheiro, aceito.
- **Permissão de notificação depois do primeiro bloco**, com o horário do bloco como sugestão. Motivo: o iOS só deixa pedir uma vez e o pedido com contexto tem mais aceitação. Origem: conselheiro, aceito.
- **Fechamento do bloco numa sheet só** (Terminei, Ainda continua com "onde parei", Fiz outra coisa). Saem as telas Bloco feito, Você andou, Ainda continua e Fiz outra coisa. Origem: conselheiro, aceito.
- **Sai a classificação "desvio".** "Fiz outra coisa" vira passo ou vai para Pra depois. Origem: conselheiro, aceito.
- **"Fora do ritmo" sem escolha.** O app ajusta as datas sozinho e mostra desfazer. Motivo: três opções paralisam. Origem: conselheiro, aceito.
- **Travou com uma sugestão só** em vez de quatro. Origem: conselheiro, aceito.
- **Conquistas sai como tela.** Thayana tinha pedido uma tela com as metas concluídas. O conselheiro apontou que a linha acumulada mede esforço e contradiz o princípio de atribuição. Decisão: manter o valor pedido dentro do Caminho, com bandeiras nas paradas concluídas e a lista de objetivos concluídos. Origem: conselheiro; ajuste do PM para preservar o pedido.
- **Paradas nas semanas 3, 7 e 12** (antes 4, 8 e 12). Motivo: a primeira parada precisa chegar dentro da validação de 2 a 4 semanas. O conselheiro sugeriu semana 2; adotada a semana 3 para dar espaço a 4 a 6 passos. Origem: conselheiro, ajustado pelo PM.
- **Passo cabe em até 3 blocos.** Motivo: passo grande gera dias sem avanço visível. Origem: conselheiro, aceito.
- **Volta depois de 7+ dias replaneja sozinha**, com desfazer. Origem: conselheiro, aceito.
- **Validação pelo Expo Go, não TestFlight.** O conselheiro sugeriu TestFlight, que exige a conta paga da Apple; isso fere a restrição de custo zero. Pendente: provar notificação local e armazenamento no Expo Go. Origem: PM.
- **Tema escuro fica como Should (dentro do FR-016)**, não Could. Motivo: já está desenhado, foi pedido pela dona e custa pouco no nativo. Origem: PM, divergindo do conselheiro.
- **Celebrações de parada e dia 84 como Should**, em vez de Must. Motivo: a validação de 2 a 4 semanas talvez não chegue ao dia 84; a atribuição diária já cobre a recompensa. Origem: PM.

## 13/11/2026 — Arquitetura (architecture.md v1.0)

- **ADR-001** Expo + React Native + TypeScript estrito; só módulos nativos que já vêm no Expo Go; SDK = o que o Expo Go da loja suportar no spike. Origem: arquiteto.
- **ADR-002** SQLite local (expo-sqlite, WAL) com Drizzle ORM; toda ação é uma transação gravada antes do retorno visual. Origem: arquiteto.
- **ADR-003** Sem conta, sem rede, sem SDK de terceiros na v1; "Já tenho uma conta" fica oculto por flag. Origem: arquiteto.
- **ADR-004** Banco como verdade com consultas reativas; Zustand só para estado de UI efêmero. Origem: arquiteto.
- **ADR-005** Regras em domínio puro e testável; erros como Result com catálogo de textos sem culpa. Origem: arquiteto.
- **ADR-006** Termos do domínio em português; banco snake_case; UUID; instantes em ms; dia como YYYY-MM-DD. Origem: arquiteto.
- **ADR-007** expo-router com pilha única e sheets nativas (formSheet); sem abas. Origem: arquiteto.
- **ADR-008** Timer por carimbos + notificação local agendada; dia vira às 4h; no máximo 2 notificações pendentes. Origem: arquiteto.
- **ADR-009** Receitas em JSON validadas por Zod. Origem: arquiteto.
- **ADR-010** Tokens próprios + StyleSheet + Reanimated + SF Symbols; cor literal fora dos tokens reprova. Origem: arquiteto.
- **ADR-011** Distribuição: Expo Go; para testadoras, organização Expo + EAS Update gratuito (a provar no spike); se falhar, conta paga da Apple. Origem: arquiteto.
- **ADR-012** Métricas por tabela local de eventos, exportadas pela testadora, sem texto livre. Origem: arquiteto.
- **ADR-013** Dependências mínimas (drizzle, zustand, zod); lockfile; audit; Jest com 100% do domínio coberto. Origem: arquiteto.

## 24/11/2026 — Pivô v2: retomar estudo

- **Público estreitado para quem largou um curso online ou uma certificação.** A dor escolhida pela dona foi "comecei e larguei"; estudo e carreira foi o recorte pedido. Concursos ficam de fora por terem muitos planos prontos. Origem: dona, após análise crítica e varredura de concorrentes.
- **Sumário colado no lugar de receitas.** Cada linha vira tópico; linhas de módulo viram grupos. Resolve a quebra sem IA. Origem: PM, aceito pela dona.
- **Novo momento de valor: "até onde você foi" com a porcentagem já feita (FR-018).** Origem: PM.
- **Porcentagem de conteúdo passa a ser permitida.** Mede tópicos feitos, não esforço; streak e horas continuam proibidos. Origem: PM.
- **Sem IA na v2; IA entra depois para quem não tem sumário.** Origem: dona.
- **Pagamento único: grátis para 1 estudo; R$ 59 libera estudos ilimitados, ritmo por data de prova e exportação.** Origem: dona (pagamento único), PM (corte grátis/pago, aceito).
- **Compra dentro do app só depois da validação de uso.** Compras da Apple exigem conta paga e build próprio; a intenção de compra é medida por pré-venda fora do app. Origem: PM.
- **Telas v2 publicadas no mesmo canvas** (32 pranchetas): Começar ganha uma terceira etapa e o Progresso substitui o Caminho; nova sheet "Rumo completo". Origem: PM/UX.
- **Arquitetura precisa de atualização:** ADR-009 substituída por importador de sumário; nova ADR de compra única. Pendente. Origem: PM.
