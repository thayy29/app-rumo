# Rumo — spike da semana 1

App para quem largou um curso online ou uma certificação e quer retomar de onde parou. Este repositório começa com o **spike**: uma prova técnica que confirma, no seu iPhone, as 5 peças arriscadas antes de construir as telas de verdade.

Planejamento completo em [`docs/planejamento`](docs/planejamento): PRD v2, arquitetura, design e registro de decisões.

## Stack

Expo SDK 57 (React Native 0.86) · TypeScript estrito · expo-router · SQLite (expo-sqlite) + Drizzle ORM · notificações locais (expo-notifications) · Jest. Tudo roda no **Expo Go**, sem conta paga da Apple.

## Como rodar

### Pré-requisitos (uma vez só)

1. **Node 22 ou mais novo** no computador (`node -v`).
2. **Expo Go** instalado no iPhone (App Store).
3. **Conta gratuita no Expo** ([expo.dev/signup](https://expo.dev/signup)). No iPhone físico, o Expo Go só abre o projeto se ele e o computador estiverem logados na **mesma conta**.

### Rodar

```bash
npm install
npx expo login        # mesma conta que você usa no Expo Go
npx expo start
```

Escaneie o QR code com a **câmera do iPhone**. O computador e o iPhone precisam estar no mesmo Wi-Fi. Se a sua rede bloquear, use `npx expo start --tunnel`.

> **"Project is incompatible with this version of Expo Go"?** O Expo Go da loja foi atualizado para o SDK 58. Rode `npx expo install expo@^58.0.0 --fix` e tente de novo.

### Conferir o código

```bash
npm test            # testes do domínio (importador de sumário e timer)
npm run typecheck   # TypeScript
npx expo lint       # lint
```

## Os 5 testes

Abra o app no iPhone e siga cada cartão da tela. Anote o resultado na tabela do fim.

| # | Teste | Como fazer | Passou se… |
|---|---|---|---|
| 1 | **Banco local** | Importe um sumário (teste 2). Feche o app à força (deslize para cima no seletor de apps) e reabra. | Os números de estudos, tópicos e tópicos feitos continuam iguais. |
| 2 | **Colar o sumário** | Troque o exemplo por um sumário real copiado de um curso seu. Toque em Importar e depois no último tópico que você terminou. | O resumo "N tópicos em M módulos" bate com o curso e a porcentagem aparece. |
| 3 | **Timer** | Comece um bloco de 1 min e feche o app à força. Espere o aviso. Reabra. Depois teste Pausar e Retomar num bloco de 25 min. | O aviso de fim chega com o app fechado e o tempo mostrado bate com o relógio (±1 s). |
| 4 | **Notificações** | Toque em "Lembrete em 2 min" e feche o app. Depois toque em "Lembrete diário às 20h". | O lembrete chega com o app fechado; "Agendadas agora" mostra os pendentes. |
| 5 | **Sheet nativa** | Toque em "Abrir sheet", arraste para cima e para baixo, feche arrastando. | Abre e fecha com o gesto do iPhone, com alça e fundo recuando. |

### Resultado

| # | Resultado | Observação |
|---|---|---|
| 1 | ☐ passou ☐ não passou ☐ com ajuste | |
| 2 | ☐ passou ☐ não passou ☐ com ajuste | Plataforma do sumário: |
| 3 | ☐ passou ☐ não passou ☐ com ajuste | |
| 4 | ☐ passou ☐ não passou ☐ com ajuste | |
| 5 | ☐ passou ☐ não passou ☐ com ajuste | |

Se algo falhar, copie a mensagem de erro (do terminal ou da tela vermelha) para corrigir.

## Estrutura

```
src/
  app/          telas (expo-router): _layout, index (spike), sheet
  domain/       regras puras e testadas: importador de sumário, timer por carimbos
  data/         SQLite + Drizzle: schema e conexão
  features/     casos de uso (cada ação = uma transação)
  platform/     notificações, IDs
  ui/           tokens de cor do DESIGN.md
drizzle/        migrações geradas (npm run db:generate)
docs/           planejamento (PRD, arquitetura, design, decisões)
```

Regra de dependência: `app → features → (domain, data, platform)`. O `domain` não importa nada de fora dele.

## Depois do spike

Com os 5 testes passando, a semana 2 começa a v0.1: colar o sumário e "até onde você foi" nas telas reais do canvas, seguido de Hoje, Foco e Progresso. A tela de spike sai.
