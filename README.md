# Rumo

App para quem largou um curso online ou uma certificação e quer retomar de onde parou: cola o sumário, marca até onde foi e vê quanto já fez.

Planejamento completo em [`docs/planejamento`](docs/planejamento): PRD v2, arquitetura, design e registro de decisões. Telas de referência no canvas "Rumo — retomar estudo (v2)".

## Onde estamos

| Semana | Entrega | Situação |
|---|---|---|
| 1 | Spike técnico (banco, importador, timer, notificações, sheet) | ✅ os 5 testes passaram no iPhone |
| 2 | Início, Começar (estudo e sumário) e Até onde você foi | ✅ nesta versão |
| 3 | Hoje com os estados do canvas | a fazer |
| 4 | Foco, fechamento do bloco e Progresso | a fazer |
| 5 | Volta depois de sumir, lembrete, acabamento | a fazer |

## Stack

Expo SDK 58 (React Native 0.88) · TypeScript estrito · expo-router · SQLite (expo-sqlite) + Drizzle ORM · notificações locais (expo-notifications) · Jest. Tudo roda no **Expo Go**, sem conta paga da Apple.

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

> **"Project is incompatible with this version of Expo Go"?** O projeto e o Expo Go precisam estar no mesmo SDK (hoje, 58). Atualize o Expo Go na App Store; se a loja já estiver numa versão mais nova, rode `npx expo install expo@latest --fix`.

### Conferir o código

```bash
npm test            # testes do domínio (importador de sumário e timer)
npm run typecheck   # TypeScript
npx expo lint       # lint
```

## Como testar esta versão

1. Abra o app: aparece o **Início** com o mascote e o "rumo.".
2. **Começar** → escolha o tipo e dê um nome.
3. **Cole o sumário** de um curso seu. O cartão embaixo mostra "N tópicos em M módulos" enquanto você cola.
4. **Toque no último tópico que você fez**: ele e os anteriores ficam marcados e aparece a porcentagem. Tocar de novo no "último feito" desmarca ele.
5. **Ir para o Hoje**: mostra o próximo tópico e a porcentagem (versão provisória; os estados do canvas chegam na semana 3).
6. Feche o app à força e abra de novo: ele volta direto no Hoje. "Trocar de estudo" apaga e volta ao Início.

Teste também com o iPhone no **modo escuro** e com o **texto grande** (Ajustes > Acessibilidade > Tela e Tamanho do Texto).

## Estrutura

```
src/
  app/          telas (expo-router): inicio, comecar/*, hoje
  domain/       regras puras e testadas: importador de sumário, timer por carimbos
  data/         SQLite + Drizzle: schema e conexão
  features/     casos de uso (cada ação = uma transação)
  platform/     notificações, IDs
  state/        estado efêmero do fluxo de começo (Zustand)
  ui/           tokens, mascote, logotipo e componentes do design
drizzle/        migrações geradas (npm run db:generate)
docs/           planejamento (PRD, arquitetura, design, decisões)
```

Regra de dependência: `app → features → (domain, data, platform)`. O `domain` não importa nada de fora dele.
