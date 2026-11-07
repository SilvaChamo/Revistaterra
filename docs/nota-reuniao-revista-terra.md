# Nota de reunião: Revista Terra, o que falta decidir

Tudo o que não está nesta lista já está feito e a funcionar em teste: newsletter (envio diário, agendamentos, publicidade, leituras), Arquivo do site e Partilhado, Colunistas e Artigos de Opinião.

## Como está hoje (temporário, só para testes e proposta)

| Item | Estado actual | Definitivo depois da reunião |
|---|---|---|
| Remetente da newsletter | `noreply@visualdesignmoz.com` (sem respostas) | A decidir (ponto 2) |
| E-mail da redacção (Partilhado) | Não definido, a sincronização está desligada | A decidir (ponto 2) |
| Domínio do site | Ainda não aponta para a Vercel | A decidir (ponto 1) |
| Antivírus dos anexos | Desligado, anexos ficam retidos | A decidir (ponto 3) |
| Planos e preços | Valores de proposta, editáveis no painel | Aprovar valores finais (ponto 4) |

## 1. Domínio

Perguntas para decidirem:

- Qual é o domínio oficial do site: `revistaterraonline.com` ou `revistaterra.co.mz`? Hoje a página de contactos usa `revistaterra.co.mz` e o site antigo está em `revistaterraonline.com`.
- Quem controla o DNS e pode apontá-lo para a Vercel?

Precisamos de: acesso ao painel do DNS (ou que o responsável crie os registos que lhe indicarmos).

## 2. E-mails

Decidirem:

- Remetente das newsletters: por exemplo `info@revistaterraonline.com`, sem respostas, ou com respostas para uma caixa que alguém leia.
- Endereço da redacção para receber fotos e ficheiros dos colaboradores (por exemplo `redaccao@…`).
- Onde ficam as caixas (hospedagem actual do domínio) e quem as cria.

Precisamos de: as duas caixas criadas, o servidor IMAP, o utilizador e a palavra-passe da caixa da redacção, e de validar o domínio no Brevo (dois ou três registos DNS para o remetente ser aceite como próprio).

## 3. Antivírus dos anexos

Os ficheiros que chegam por e-mail à redacção são analisados antes de aparecerem no painel. Opções:

- Ligar o antivírus (ClamAV) no servidor que já usamos. Custo: nenhum extra, usa o servidor existente.
- Não usar antivírus: os anexos ficam retidos e só se libertam à mão. Não recomendado.

## 4. Planos e preços

Confirmarem os planos, os valores em meticais (MT) e as formas de pagamento que vão aparecer ao público. Os valores actuais são de proposta.

## 5. Publicidade da newsletter

Confirmarem os cinco espaços (topo, cabeçalho, depois do cabeçalho, meio, rodapé), as medidas e o custo de cada um. O custo preenche-se no painel e o público vê-o em «Ver espaços de publicidade».

## O que fazemos assim que decidirem

1. Configurar o domínio e o remetente (mesmo dia, depende só do DNS e das caixas).
2. Ligar o e-mail da redacção ao Partilhado e activar a sincronização diária.
3. Passar o remetente da newsletter para o endereço definitivo e fazer um envio de teste.
4. Publicar o site (só com autorização expressa do responsável).
