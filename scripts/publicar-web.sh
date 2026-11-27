#!/usr/bin/env bash
# Gera a versão web (teste por link) e publica no GitHub Pages, branch gh-pages.
# Endereço: https://thayy29.github.io/app-rumo/
set -euo pipefail
raiz="$(pwd)"
saida="$(mktemp -d)"
# Versão visível no rodapé do Hoje: confirma no celular que a atualização chegou.
export EXPO_PUBLIC_VERSAO="$(TZ=America/Sao_Paulo date +%d/%m\ %Hh%M) · $(git rev-parse --short HEAD)"
EXPO_OFFLINE=1 CI=1 npx expo export --platform web --output-dir "$saida"
printf '{"versao":"%s"}\n' "$EXPO_PUBLIC_VERSAO" > "$saida/versao.json"   # o app compara com a própria versão
cp "$saida/index.html" "$saida/404.html"   # abrir direto numa rota (ex.: /hoje) também funciona
touch "$saida/.nojekyll"                   # o GitHub Pages não pode esconder a pasta _expo
cd "$saida"
git init -q -b gh-pages
git add -A
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -q -m "Versão web de teste"
git -c push.negotiate=true push -q -f "$(git -C "$raiz" remote get-url origin)" gh-pages
echo "Publicado em https://thayy29.github.io/app-rumo/"
