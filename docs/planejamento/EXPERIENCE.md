# EXPERIENCE.md — User Experience Plan

**Projeto:** Rumo · **Versão:** 1.0 · **Data:** 13/11/2026 · **Fonte:** `prd.md` v1.0, `DESIGN.md` v1.0

---

## Overview

**4 telas e 5 sheets.** Telas: Começar (2 passos), Hoje, Foco, Caminho. Sheets: Dia difícil, Travou, Fechamento do bloco, Semana, Ajustes. O resto são estados do Hoje.

Regra de navegação: **o app sempre abre no Hoje** (ou no Foco, se houver bloco rodando). Não há barra de abas.

```
               ┌──────────── mini-trilha ────────────┐
Começar 1 → Começar 2 → FOCO ⇄ HOJE ──────────────────→ CAMINHO
                         │      │  ├─ sheet Dia difícil
                         │      │  ├─ sheet Semana (1ª abertura da semana)
                         │      │  ├─ sheet Ajustes (ícone)
                         │      │  └─ estados: já contou · você voltou · celebração
                         ├─ sheet Travou
                         └─ sheet Fechamento (fim do bloco)
```

Persona: adulta com TDAH, 25 a 45 anos, com um objetivo pessoal (música, código, estudo, texto) que começou e largou mais de uma vez. Usa o celular o dia todo; decide mal sob cansaço; volta quando não sente vergonha.

---

## User Journeys

### Journey 1: Começar e fazer o primeiro bloco (FR-001, FR-002, FR-003, FR-010)
**Objetivo:** primeiro bloco rodando em até 90 s. **Entrada:** primeira abertura.

#### Happy Path
1. **Começar 1:** logotipo, a pergunta do mascote, 4 tipos e o campo "o que estará pronto no último dia". Continuar.
2. **Começar 2:** caminho com 3 paradas (semanas 3, 7, 12); a parada 1 aberta com 4 a 6 passos sugeridos e editáveis. "Começar agora · 25 min".
3. **Foco** com o primeiro passo.
4. Fim do bloco → **sheet Fechamento** → "Terminei" ou "Ainda continua".
5. **Hoje · já contou**, com o cartão do lembrete: "Amanhã às 20h te chamo pro próximo passo?" → permissão do iOS.

Tempo estimado até o Foco: 60 a 90 s.

#### Decision Points & Alternative Paths
- **"Outra coisa" no tipo:** receita genérica, mesmo fluxo.
- **"Depois" no Começar 2:** vai ao Hoje sem iniciar; o cartão do lembrete aparece no Hoje uma vez.
- **Permissão negada:** sem novo pedido; faixa de uma linha no Hoje no dia seguinte aponta para Ajustes, uma única vez.

#### Drop-off Risk Notes
Passos sugeridos genéricos (pessoa sente que vai ter que reescrever tudo) e campo de texto vazio no passo 1. Mitigação: exemplo específico por tipo no campo; passos sugeridos testados com pessoas reais.

### Journey 2: O dia (FR-004 a FR-009)
**Objetivo:** fazer um bloco e ver o caminho andar. **Entrada:** abrir o app ou tocar no lembrete.

#### Happy Path
Hoje → Começar · 25 min → Foco → Terminei → sheet Fechamento → Terminei → Hoje · já contou (mini-trilha andou, "faltam N passos").

#### Decision Points & Alternative Paths
- **Dia ruim:** "Hoje tá difícil" → sheet Dia difícil → difícil (1 bloco) ou impossível (5 min). O cartão do Hoje mostra a versão menor.
- **Travou no Foco:** sheet Travou → "5 min na parte mais fácil" (vira o bloco) ou "Hoje não vai rolar".
- **Passo continua:** Fechamento → Ainda continua → campo "onde você parou?" → Hoje · já contou com o mesmo passo.
- **Fiz outra coisa:** Fechamento → escrever o que fez → "virou um passo" ou "Pra depois".
- **Ideia no meio do bloco:** Anotar → campo → volta ao timer.

#### Drop-off Risk Notes
Passo que nunca termina. Mitigação: regra de até 3 blocos por passo; após 3 respostas "Ainda continua" no mesmo passo, o Fechamento sugere dividi-lo em dois.

### Journey 3: Voltar e ajustar (FR-011, FR-012, FR-015)
**Objetivo:** voltar depois de sumir e seguir o plano sem replanejar.

#### Happy Path
- **Volta (2+ dias):** Hoje · você voltou → nota de onde parei → "Voltar pequeno · 5 min" → Foco.
- **Semana nova:** primeira abertura da semana → sheet Semana → resumo, próximo passo, datas ajustadas se preciso → fechar.
- **Parada concluída:** Terminei no último passo da parada → celebração → Hoje.

#### Decision Points & Alternative Paths
- **7+ dias fora:** datas empurradas automaticamente; uma linha "Empurrei as datas em 9 dias" com Desfazer.
- **Dia 84:** celebração final com "Escolher o próximo rumo" → Começar 1 (o objetivo vira bandeira no Caminho).

#### Drop-off Risk Notes
Vergonha de voltar. Mitigação: nenhum texto fala em atraso ou falha; nenhuma métrica de sequência.

### Journey 4: Ver o todo (FR-013, FR-014, FR-016)
Hoje → toque na mini-trilha → Caminho (paradas, posição, passos da parada atual, Pra depois, objetivos concluídos) → voltar. Ajustes: ícone no Hoje → sheet.

---

## Screen / State Inventory

### Screen: Começar 1 — Objetivo
**Propósito:** tipo e o que estará pronto. **FR:** 001.
```
[‹]  ▬▬▬ ▭▭▭
       rumo.
(•‿•) "O que você quer terminar nas próximas 12 semanas?"
[ Música ✓ ] [ Código ]
[ Estudo   ] [ Texto  ]
 Outra coisa
 No último dia, o que vai estar pronto?
[ 2 tracks exportadas            ]
(        Continuar        )
```
**Estados:** Padrão (nada escolhido, botão desativado com "Escolha um tipo" embaixo) · Preenchido · Erro (campo vazio ao tocar continuar: Footnote em `error`).

### Screen: Começar 2 — Caminho
**Propósito:** aceitar ou corrigir o caminho sugerido e começar. **FR:** 002, 003.
```
[‹]  ▬▬▬ ▬▬▬
(•‿•) "Pra uma música, o caminho costuma ser esse."
 ● Semana 3  Track 1 toca inteira        (aberta)
   ① Escolher a paleta de sons        ×
   ② Montar intro e drop              ×
   ③ Fechar o arranjo do meio         ×
   ④ Transições entre seções          ×
   ＋ Adicionar passo
 ○ Semana 7  Track 2 também, e a 1 mixada
 ⚑ Semana 12 As duas masterizadas
(   Começar agora · 25 min   )
     Depois
```
**Estados:** Padrão · Editando passo (campo em linha, dica "um passo cabe em até 3 blocos") · Vazio (passos todos removidos: botão desativado com "Adicione pelo menos um passo").

### Screen: Hoje
**Propósito:** o passo de hoje e a posição no caminho. **FR:** 004, 005, 009, 010, 011, 012, 015.
```
                                  [⚙]
(•‿•) "Hoje é só isso aqui:"
╭─────────────────────────────────╮
│   Fechar o arranjo do meio      │
│   ○─○─◎─○─○─○   (mini-trilha)   │
│ Com isso, a track 1 toca inteira│
│ (     Começar · 25 min      )   │
╰─────────────────────────────────╯
        Hoje tá difícil
        Anotar
```
**Estados:**
- **Padrão** — acima.
- **Dia reduzido** — cartão mostra "Dia difícil · 1 bloco" ou "Dia impossível · Só abrir e olhar · 5 min".
- **Já contou** — mascote feliz, "Hoje já contou", mini-trilha andou, "Amanhã: [próximo passo]", "Fazer mais um bloco"; no primeiro dia, cartão do lembrete.
- **Você voltou** — "Que bom te ver. Foram 4 dias." + nota de onde parei + "Voltar pequeno · 5 min"; com 7+ dias, linha "Empurrei as datas em 9 dias · Desfazer".
- **Celebração** — tela cheia momentânea: mascote e bandeira, "Existe agora.", texto da parada.
- **Vazio** — sem objetivo: abre o Começar 1.
- **Erro** — faixa de uma linha (lembrete negado, falha ao gravar).

**Sheets:** Dia difícil (2 linhas: difícil, impossível) · Semana (resumo, próximo passo, ajuste de datas, Pra depois, contar pra alguém) · Ajustes.

### Screen: Foco
**Propósito:** fazer o bloco. **FR:** 006, 007, 008.
```
[×]              Passo 3 de 6 · bloco 1 de 2
          Fechar o arranjo do meio
               ◜  18:42  ◝  (•_•)
                 de 25 min
(            Terminei            )
   Anotar     Pausar     Travei
```
**Estados:** Rodando · Pausado (relógio em `muted`, botão principal vira "Continuar") · Fim (abre Fechamento sozinho, com vibração leve).
**Sheets:** Travou (uma sugestão + "Hoje não vai rolar") · Fechamento ("E o passo?": Terminei, Ainda continua, Fiz outra coisa) · Anotar (campo único).

### Screen: Caminho
**Propósito:** a visão do todo. **FR:** 013, 014.
```
[‹]  Seu caminho              Semana 2 de 12
   trilha: ●──◎──○──⚑  (paradas e posição)
 Você está aqui: Fechar o arranjo do meio
 Parada 1 · passos (feitos riscados)
 Pra depois (4)
 Rumos concluídos ⚑ ⚑
```
**Estados:** Padrão · Editando (reordenar e remover passos) · Sem rumos concluídos (seção oculta) · Pra depois vazio (seção oculta).

---

## Error & Edge Case Catalogue

| Caso | Exibição | Recuperação |
|---|---|---|
| Lembrete negado | Faixa no Hoje, uma vez | "Ativar em Ajustes" abre os ajustes do iOS |
| Falha ao gravar | Faixa no Hoje | Repetir automaticamente; ação mantida na tela |
| App encerrado durante o bloco | Ao reabrir, o Foco mostra o tempo certo ou o Fechamento se acabou | Nenhuma ação |
| Passo continua 3 vezes | Fechamento sugere "Dividir em dois passos?" | Divide ou ignora |
| Parada passou da data | Semana ajusta as datas e mostra Desfazer | Desfazer |
| 7+ dias fora | Você voltou com datas empurradas | Desfazer |
| Todos os passos removidos | Botão desativado com o motivo | Adicionar passo |

---

## Interaction & Animation Spec

| Momento | Movimento | Significado |
|---|---|---|
| Toque em qualquer controle | Escala 0,97 em 100 ms, no pressionar | Resposta imediata |
| Sheet abre | Sobe com mola sem quique (resposta 0,3 s), fundo recua e escurece | Camada temporária |
| Passo concluído | Mascote pula para a próxima casa com mola de leve quique (0,8 / 0,4 s) + vibração leve | Recompensa por ação da pessoa |
| Parada concluída | Bandeira entra com mola, vibração de sucesso | Marco |
| Entrada de tela | Esmaecer e subir 10 pt, sem quique | Decorativo |

Nada se mexe em laço. Com "reduzir movimento", tudo vira esmaecer de 200 ms e a vibração continua.

---

## Dev Handoff Notes

- Toda ação grava antes de dar retorno visual (NFR-004).
- O timer guarda o horário de início, não um contador (NFR-003).
- Receitas de caminho em arquivo de dados (NFR-008).
- Pranchas de referência no canvas "App pessoal — telas da v1", claro e escuro.
