# Regras do responsável (SilvaChamo)

Estas regras são obrigatórias para todos os agentes de IA (Claude, Copilot, Cursor, Codex, Gemini, etc.) e valem para todos os projectos do responsável. Lê-as antes de qualquer alteração. Antes de mexer num projecto, vê que tipo de projecto é (site/revista, loja, aplicação web, aplicação móvel, API/backend, painel de administração, biblioteca, scripts, etc.) e aplica as regras específicas conforme o género. Se o projecto tiver regras próprias, estas complementam-nas; em caso de conflito, prevalecem as do projecto.

## Universais (todos os projectos)

1. **Branches:** nunca usar nomes que identifiquem uma IA (`claude/...`, `copilot/...`, `cursor/...`, `ai/...`, `gpt/...`). Usar nomes descritivos (`feature/card-noticias`, `fix/menu-mobile`). Se a sessão impuser um nome com IA, renomear antes de fazer push.
2. **Deploy:** nunca fazer deploy sem autorização expressa do responsável. Um commit não autoriza deploy. Pode fazer commits no fim de uma acção aprovada.
3. **Autoria:** commits e deploys em nome de SilvaChamo. Nunca usar identidade de IA como autor ou committer.
4. **Mensagens de commit:** em português, formato `SilvaChamo: <o que foi feito>`. Sem mais texto, sem linhas extra, sem `Co-Authored-By` de IA, sem links de sessão, sem "Generated with ...", sem nomes ou logótipos de IA, nem em commits nem em PR.
5. **Comunicação:** não narrar o que se está a fazer durante a tarefa. No fim, apenas o resultado, no máximo 3 parágrafos, quanto menos melhor.
6. **Autonomia:** o responsável vê apenas o resultado final. Nunca mandar o responsável fazer o que o agente consegue fazer.
7. **Actualizações:** em local, nunca desligar a página/servidor nem obrigar a fechá-la e reabri-la (hot reload apenas). Online, uma actualização nunca impede o utilizador de fazer algo: sem bloquear ecrãs, formulários ou acções. Deve ser só um breve "piscar".
8. **Consistência:** antes de criar algo novo, ver como o que já existe está feito e seguir o mesmo padrão (cores, fontes, espaçamentos, bordas, raios, sombras, nomes, estrutura de código). Nada desenquadrado do que está em produção.

## Específicas por género de projecto

- **Sites, revistas, blogs, lojas, portais (interface web):**
  - Pré-visualização local com duas vistas, mobile e desktop; verificar nas duas antes de dar por concluído.
  - Fonte principal Verdana em todos os componentes, incluindo páginas novas e detalhes (ex.: leitor de áudio).
  - Tamanho da fonte proporcional ao componente: nada de fontes de título em popups ou cards pequenos.
  - Cards: título numa só linha. Excepção: notícias e outros componentes em que duas linhas sejam recomendadas. Margens, paddings e espaçamentos iguais entre cards do mesmo tipo.
  - Reutilizar cores, margens (verticais, horizontais e laterais), espaçamentos, bordas, raios e sombras do site.
- **Painéis de administração / dashboards:** as mesmas regras de interface, adaptadas à densidade de um painel (tabelas, formulários, filtros). Nunca bloquear o utilizador durante gravações ou actualizações. Respeitar permissões e papéis existentes.
- **Aplicações móveis:** seguir os padrões visuais e de navegação já existentes na app e da plataforma (iOS/Android). Verificar em ecrãs pequenos e grandes. Fonte e tamanhos proporcionais ao componente.
- **APIs / backend / bases de dados:** sem regras visuais. Manter contratos e nomes existentes, não quebrar clientes actuais, nunca apagar ou alterar dados em produção sem autorização expressa, migrações reversíveis, mensagens de erro claras.
- **Scripts, ferramentas, bibliotecas:** seguir o estilo e a estrutura do código existente, sem dependências novas sem necessidade, documentação curta do que muda.
- **Outro género:** aplicar as universais e adaptar as específicas por analogia ao género mais próximo.

## Este projecto: Revista Terra

Site/revista (Next.js). Aplicam-se as universais e as de "Sites, revistas, blogs, lojas, portais".
