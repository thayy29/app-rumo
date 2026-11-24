# DESIGN.md — Visual System

**Projeto:** Rumo · **Versão:** 1.0 · **Data:** 13/11/2026 · **Fonte:** `prd.md` v1.0
**Plataforma:** iPhone (iOS 17+), retrato. iPad e paisagem fora da v1.

> Documento de planejamento travado. A ferramenta de desenvolvimento lê, não edita. Mudanças entram no `decision-log.md`.

---

## 1. Design Tokens

### 1.1 Color Palette

Todos os pares de texto abaixo foram conferidos com `contrast-check.py` (resultados em `contraste.txt`).

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `bg` | `#F7F4EA` | `#191719` | Fundo das telas |
| `bg-2` | `#F1EDE0` | `#201E21` | Fundo de celebração |
| `ink` | `#2A2722` (13,5:1) | `#F4F1E8` (15,8:1) | Texto principal |
| `muted` | `#5F584E` (6,4:1) | `#C8C2B8` (10,1:1) | Texto de apoio |
| `action` | `#4574C5` | `#7699D4` | Fundo do botão principal; ícones ativos |
| `action-ink` | `#FFFFFF` (4,6:1 sobre `action`) | `#191719` (6,2:1 sobre `action`) | Texto do botão principal |
| `action-text` | `#2F59A6` (6,2:1) | `#8FB0E3` (8,1:1) | Texto clicável (botões de texto, links) |
| `detail` | `#C1D1EB` | `#C1D1EB` | Preenchimento suave: casas andadas, seleção, bandeira |
| `detail-ink` | `#2F59A6` | `#C1D1EB` (11,5:1) | Marcação forte: trilha percorrida, "você está aqui" |
| `error` | `#A3261E` (6,7:1) | `#F2B8B5` (10,4:1) | Só em falha de permissão ou de gravação |
| `sep` | `rgba(60,50,40,.16)` | `rgba(255,255,255,.13)` | Separador de lista |

**Regra:** `action` (`#4574C5`) nunca é cor de texto sobre o creme (4,2:1, reprova). Texto clicável usa `action-text`.

**Sem cores de sucesso, aviso ou info.** Sucesso é o caminho andando (`detail`/`detail-ink`), não verde. Não existe estado de aviso que cobre a pessoa.

### 1.2 Typography

Fonte do sistema (SF Pro). Números grandes em SF Pro Rounded. Escala do iOS (Dynamic Type no tamanho padrão), com o entreletra que a Apple usa em cada tamanho:

| Estilo | Tamanho / altura | Peso | Entreletra | Uso |
|---|---|---|---|---|
| Large Title | 34 / 41 | Bold | +0,011em | Título das telas Caminho e celebração |
| Title 1 | 28 / 34 | Bold | +0,013em | Passo do dia |
| Title 2 | 22 / 28 | Bold | +0,016em | Título de sheet e do Foco |
| Headline | 17 / 22 | Semibold | −0,025em | Fala do mascote, botões |
| Body | 17 / 22 | Regular | −0,025em | Linhas de lista, campos |
| Subheadline | 15 / 20 | Regular | −0,015em | Texto de apoio |
| Footnote | 13 / 18 | Regular | −0,006em | Subtítulo de linha, cabeçalho de grupo |
| Timer | 66 | Semibold Rounded | 0 | Relógio do Foco |

Corpo nunca abaixo de 17 pt. Todo texto escala com o tamanho escolhido no iOS até AX3.

### 1.3 Spacing Scale (8px grid)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40`. Margem lateral das telas: 20. Distância entre blocos de conteúdo: 16 a 24. Altura mínima de linha de lista: 52.

### 1.4 Breakpoints

App só de iPhone. Larguras de referência: 375 pt (iPhone SE e mini), 393 pt (iPhone 15/16), 430 pt (Pro Max). O conteúdo é uma coluna; acima de 393 pt só a margem cresce. Nenhuma largura gera rolagem horizontal.

### 1.5 Elevation & Shadows

| Nível | Claro | Escuro | Uso |
|---|---|---|---|
| 0 | nenhuma | nenhuma | Linhas de lista, campos |
| 1 | `0 1px 2px rgba(0,0,0,.035), 0 10px 30px rgba(0,0,0,.05)` | `0 10px 30px rgba(0,0,0,.35)` | Cartão do passo do dia |
| 2 | `0 -10px 40px rgba(0,0,0,.10)` | `0 -10px 40px rgba(0,0,0,.45)` | Sheets |

Material de vidro só em camadas flutuantes: botões de navegação, sheets. Nunca vidro sobre vidro.

### 1.6 Border Radius

Cantos concêntricos: botão 25 (cápsula) · linha de grupo 24 · cartão 30 · sheet 40 · bloco de escolha 26 · campo 14.

---

## 2. Component Specifications

### 2.1 Button — Primary
Cápsula de 50 pt de altura, largura total, fundo `action`, texto `action-ink` Headline. Estados: padrão; pressionado (escala 0,97 e brilho 95%, resposta no toque, não na soltura); desativado (opacidade 40%, com o motivo escrito embaixo); carregando (não existe na v1, nada depende de rede). Um por tela.

### 2.2 Button — Secondary (texto)
Texto `action-text` Body, área de toque 44 pt de altura. Para a segunda ação de cada tela.

### 2.3 Button — Destructive
Só em "Trocar de objetivo", dentro de um alerta do sistema. Texto em `error`. Não há outra ação destrutiva na v1.

### 2.4 Text Input
52 pt de altura, raio 14, fundo de célula, sem borda. Placeholder em `muted`. Contador aparece só nos últimos 20 caracteres do limite. Erro: texto `error` em Footnote embaixo do campo, nunca só cor.

### 2.5 Card
Cartão do passo do dia: raio 30, elevação 1, padding 24, conteúdo centralizado (passo em Title 1, mini-trilha, frase do que destrava, botão principal).

### 2.6 Modal / Dialog → Sheet
Sheet flutuante, afastada 8 pt das bordas, raio 40, alça de 38×5 no topo, fundo escurecido a 20% (claro) ou 46% (escuro) e conteúdo de trás recuado a 95,5%. Fecha arrastando para baixo, tocando fora ou pelo botão de fechar. Foco do VoiceOver preso dentro da sheet enquanto aberta.

### 2.7 Navigation
Sem barra de abas. Botões de navegação em círculo de vidro de 44 pt: voltar (chevron), fechar (×) e ajustes (controles deslizantes). A mini-trilha do Hoje é o único caminho para o Caminho.

### 2.8 Loading / Skeleton State
Não há carregamento visível: tudo é local. Se a leitura demorar mais de 300 ms, mostrar o cartão do passo com o texto em `muted` até completar.

### 2.9 Error Banner
Faixa no topo do Hoje, uma linha, ícone + texto em `error` + ação ("Ativar em Ajustes"). Usada só para lembrete negado (uma vez) e falha de gravação.

### 2.10 Mini-trilha
Linha com uma casa por passo da parada atual (até 6). Casa feita: preenchida `detail` com contorno `detail-ink`. Casa atual: anel `detail-ink` de 3 pt. Futuras: contorno `sep`. O mascote fica sobre a casa atual. Rótulo de acessibilidade: "Passo 3 de 6 até a parada 1".

### 2.11 Mascote
O ponto azul do logotipo com olhos e pés. Expressões: neutro, feliz, calmo, foco. Um por tela. Só pula (mola com quique) quando a pessoa conclui um passo; nas demais telas entra sem quique.

---

## 3. WCAG 2.1 AA Contract

| Requisito | Garantia neste sistema |
|---|---|
| Contraste de texto ≥ 4,5:1 | Todos os pares de texto da tabela 1.1 passam; menor: `action-ink` sobre `action` claro, 4,6:1 |
| Contraste de componente e gráfico ≥ 3:1 | Casas da mini-trilha, anel do timer e ícones usam `detail-ink` ou `action` (≥ 4,2:1) |
| Indicador de foco visível | Contorno de 2 pt em `action-text` com afastamento de 2 pt para teclado externo e Controle Total |
| Tudo acessível sem toque preciso | Todos os controles têm rótulo, papel e valor no VoiceOver; ações de arrastar têm botão equivalente |
| Sem rolagem horizontal | Uma coluna de 335 pt de conteúdo em 375 pt de largura |
| Alvos de toque ≥ 44×44 com 8 de espaço | Inclui o × de remover passo e os botões de navegação |
| Estado nunca só por cor | Passo feito também é riscado; seleção também tem marca de verificação |
| Reduzir movimento | Molas e pulo do mascote viram esmaecer de 200 ms |
| Reduzir transparência | Vidro vira superfície sólida |
| Aumentar contraste | Separadores e contornos sobem para 55% de opacidade |

---

## 4. Design Decisions

Ver `decision-log.md` de 13/11/2026. Principais: sem barra de abas; sem verde de sucesso; `action` proibido como texto sobre creme; vidro só em camadas flutuantes.
