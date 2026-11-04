#!/usr/bin/env bash
# Actualiza todos os projectos (repositórios git) que estão dentro de uma pasta.
# Uso:  bash scripts/actualizar-todos.sh [pasta-dos-projectos]
# Sem argumento, usa a pasta acima deste projecto.
# Segurança: só avança (fast-forward); salta os projectos com alterações por gravar e nunca apaga trabalho.

base="${1:-$(cd "$(dirname "$0")/../.." && pwd)}"
ok=0; salta=0; falha=0

for d in "$base"/*/; do
  [ -d "$d/.git" ] || continue
  nome=$(basename "$d")
  if [ -n "$(git -C "$d" status --porcelain)" ]; then
    echo "⏭  $nome: tem alterações por gravar, saltado"; salta=$((salta+1)); continue
  fi
  main=$(git -C "$d" symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|origin/||')
  main="${main:-main}"
  if git -C "$d" fetch -q origin && git -C "$d" checkout -q "$main" && git -C "$d" pull -q --ff-only origin "$main"; then
    echo "✔  $nome: actualizado ($main)"; ok=$((ok+1))
  else
    echo "✖  $nome: falhou"; falha=$((falha+1))
  fi
done

echo "Feito: $ok actualizados, $salta saltados, $falha com erro."
