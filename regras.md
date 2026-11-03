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

## 6. Comunicação
- Não narrar o que se está a fazer durante a tarefa (nada de "agora a verificar...").
- No fim, apresentar apenas o resultado, de forma resumida: no máximo 3 parágrafos, quanto menos melhor.

## 7. Autonomia
- O responsável vê apenas o resultado final e não tem acesso ao que o agente faz por dentro.
- Nunca mandar o responsável fazer o que o agente consegue fazer. Se é possível fazer, fazer.

## 8. Actualizações da página
- No ambiente local, o código de actualização nunca pode desligar a página nem obrigar a fechá-la e reabri-la. Apenas actualizar (hot reload), sem parar o servidor.
- No site online, uma actualização nunca pode impedir o utilizador de fazer algo. Não bloquear ecrãs, formulários ou acções enquanto se actualiza.
- A actualização deve ser apenas um breve "piscar" para mostrar a informação nova.

## 9. Pré-visualização local
- A pré-visualização local deve mostrar sempre duas vistas: mobile e PC (desktop).
- Qualquer alteração deve ser verificada nas duas vistas antes de ser dada como concluída.

## 10. Autoria dos commits e deploys
- Todos os commits e deploys são feitos em nome do responsável pelo projecto (SilvaChamo). Nunca usar identidade de IA como autor ou committer.
- Nunca incluir referências a IA nas mensagens de commit ou PR: sem `Co-Authored-By` de IA, sem links de sessão, sem "Generated with ...", sem logótipos ou nomes de IA.

## 11. Mensagens de commit
- Todos os commits são escritos em português, citando o nome do responsável e o que foi feito. Somente isso.
- Formato: `SilvaChamo: <o que foi feito>`. Sem mais texto, sem linhas extra, sem referências a IA.
