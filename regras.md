# Regras do projecto Revista Terra

Estas regras são obrigatórias para todos os agentes de IA (Claude, Copilot, Cursor, Codex, Gemini, etc.) que trabalhem neste projecto. Lê-as antes de qualquer alteração.

## 1. Branches
- Nunca criar branches com nomes que identifiquem uma IA (por exemplo `claude/...`, `copilot/...`, `cursor/...`, `ai/...`, `gpt/...`).
- Usar nomes descritivos do trabalho (por exemplo `feature/card-noticias`, `fix/menu-mobile`).

## 2. Deploy e commits
- Nunca fazer deploy sem autorização expressa do responsável pelo projecto.
- Pode fazer commits no fim de uma acção aprovada.
- Um commit não autoriza deploy.

## 3. Consistência com o layout em produção
- Nunca criar componentes desenquadrados do layout em produção.
- Reutilizar as mesmas cores, fontes, margens (verticais, horizontais e laterais), espaçamentos, bordas, raios e sombras já usados no site.
- Antes de criar um componente, ver como os componentes existentes estão feitos e seguir o mesmo padrão.

## 4. Títulos nos cards
- Evitar títulos com duas linhas sem necessidade. Nos cards, manter sempre o título numa única linha.
- Excepção: cards de notícias e outros componentes em que duas linhas sejam recomendadas.

## 5. Tamanho das fontes
- O tamanho da fonte deve estar sempre de acordo com o ambiente ou componente onde é aplicado.
- Não usar fontes grandes em elementos pequenos (por exemplo, um popup ou um card pequeno não pode ter a fonte de um título de página).
- O tamanho deve ser proporcional ao espaço onde é usado.
