# Site Afirma E-vias

Site institucional refeito do zero. Node 22 + Fastify 5 + TypeScript + EJS + PostgreSQL.
Sem WordPress, sem build de frontend, sem CMS: o conteúdo mora em `src/content.ts`.

## Telas

**Públicas (11)**

| Rota | Tela |
|---|---|
| `/` | Home |
| `/afirma-evias` | A empresa (linha do tempo 2002 → 2016 → 2024 → hoje) |
| `/servicos` | Serviços (8 áreas de atuação com índice fixo) |
| `/aplicativo` | Aplicativo Afirma E-vias |
| `/acreditacao-e-certificacao` | ISO 9001, política da qualidade, missão/visão/valores, comunicado 17025 |
| `/programa-de-integridade` | Compliance, canal externo e canal de relato direto |
| `/trabalhe-com-a-gente` | Envio de currículo |
| `/contato` | Formulário e endereços |
| `/politica-de-privacidade` | **novo** — política LGPD completa |
| `/termos-de-uso` | **novo** |
| `/portal-do-titular` | **novo** — requisições do art. 18 da LGPD com protocolo |

Mais `/protocolo/:codigo` (consulta pública), `/robots.txt`, `/sitemap.xml`, `/health`, 404 e página de erro.

**Painel (8)**

`/admin/login`, `/admin` (visão geral), `/admin/dados/contatos`, `/admin/dados/candidaturas`,
`/admin/dados/relatos`, `/admin/dados/lgpd`, `/admin/dados/consentimentos`, cada uma com tela de
detalhe, mais `/admin/usuarios` e `/admin/auditoria`.

As listas, detalhes e exportações do painel são geradas a partir do objeto `colecoes`
em `src/routes/admin.ts`. Para expor uma tabela nova no painel, adicione uma entrada lá —
não precisa escrever rota nem view.

## Rodar local

```bash
cp .env.example .env      # preencha DATABASE_URL, SESSION_SECRET, ADMIN_*
npm install
npm run migrate:dev
npm run dev               # http://localhost:3000
```

## Deploy no Railway

1. Suba o repositório e crie o serviço a partir dele.
2. Adicione o plugin **PostgreSQL** no mesmo projeto — ele injeta `DATABASE_URL` sozinho.
3. Configure as variáveis:
   - `SESSION_SECRET` — gere com `openssl rand -hex 32`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOME` — cria o primeiro admin na primeira migration
   - `SITE_URL` — `https://www.afirmaevias.com.br`
   - `NODE_ENV=production`
4. O `railway.json` já define `npm run migrate && npm start` como start command e `/health` como healthcheck.
5. Aponte o domínio no Cloudflare para o serviço (CNAME para o host do Railway).

A migration é idempotente: roda a cada deploy sem quebrar nada.

## O que falta

Depende de dado que só a empresa tem:

- **Registro no CREA** da pessoa jurídica e do responsável técnico. A Lei 5.194/1966,
  art. 63 exige em toda publicidade de firma de engenharia. Não está em lugar nenhum do site.
- **Nome do Encarregado (DPO).** O e-mail já está publicado; o art. 41, §1º da LGPD pede
  a identidade, não só o contato. Campo `emailEncarregado` em `src/content.ts`.
- **Data do comunicado ISO/IEC 17025** e decisão sobre exibir o aviso na Home e em Serviços.
- **Data de validade do certificado ISO 9001**, para exibir junto ao link do PDF.
- **A caixa `privacidade@afirmaevias.com.br` precisa existir.** O site já a publica como
  canal do titular; se ninguém lê, o prazo de 15 dias da LGPD corre em silêncio.

Configuração de ambiente:

- **`RESEND_API_KEY`** — sem ela os avisos por e-mail ficam desligados e os registros
  seguem apenas no `/admin`. Veja "Avisos por e-mail" abaixo.
- **`SESSION_SECRET`** — sem ela o segredo é sorteado a cada boot e o painel desloga
  a cada redeploy.
- **Backup do banco.** Não há nada configurado, e o banco guarda currículos, relatos de
  integridade e requisições LGPD.

Decisão de arquitetura em aberto:

- **Currículos são gravados como `bytea` no Postgres.** Funciona, mas o banco cresce com
  cada anexo e o backup fica pesado. Vale mover para storage externo antes do volume subir.

## Avisos por e-mail

`src/notificacoes.ts` avisa a equipe quando chega contato, currículo, relato de integridade
ou requisição LGPD. Usa a API HTTP da Resend via `fetch` nativo — sem dependência nova.

| Variável | Para que serve | Padrão |
|---|---|---|
| `RESEND_API_KEY` | Liga o envio. Ausente, o envio é ignorado com aviso no log. | — |
| `EMAIL_REMETENTE` | Remetente. Precisa ser de domínio verificado na Resend. | `site@afirmaevias.com.br` |
| `EMAIL_CONTATO` | Destino dos contatos comerciais | `comercial@` |
| `EMAIL_RH` | Destino dos currículos | `comercial@` |
| `EMAIL_COMPLIANCE` | Destino dos relatos de integridade | `comercial@` |
| `EMAIL_ENCARREGADO` | Destino das requisições LGPD | `privacidade@` |

O relato de integridade é o único que **não** vai com conteúdo nem identidade: o e-mail
informa protocolo, categoria e se é anônimo, e manda ler no painel. Despejar o texto de uma
denúncia numa caixa compartilhada derrubaria a proteção do canal.

Se preferirem SMTP próprio no lugar da Resend, o ponto de troca é a função `avisarEquipe`.

## Descarte automático

`src/retencao.ts` roda ao subir e a cada 24 h, aplicando os prazos declarados na Política
de Privacidade: currículos em 12 meses, contatos em 24 meses, requisições e consentimentos
em 5 anos, e anonimização de IP e user-agent em 6 meses (Marco Civil). Relatos de
integridade ficam de fora porque o prazo conta do fim da apuração, que é decisão humana.

Os prazos espelham a seção "Por quanto tempo guardamos" de `src/content.ts`. Mudou lá, mude aqui.

## Decisões de marca

A paleta vem direto do Manual de Marca v1.0: `#00233B`, `#566E3D`, `#BFCF99`,
`#EFEBDC`, `#F2F1EF`, `#FFFFFF`.

A tipografia é a exceção. O manual pede Exo para títulos e rótulos e Poppins para
texto corrido; o site usa **Poppins em tudo**. A Exo foi testada e tirava a
sobriedade que um site institucional de engenharia precisa ter. A hierarquia é
feita por peso, corpo e letter-spacing, não por troca de família. A logo continua
sendo o arquivo oficial e não foi tocada.

O grafismo do manual (o elemento que nasce da junção dos "i") virou o elemento estrutural do
site: a faixa de traços que abre cada herói, marca os itens de lista, separa as seções e fecha
o rodapé. É a única liberdade visual tomada — o resto é disciplina de espaçamento e tipo.

Nenhuma cor fora da paleta foi usada, a logo não recebe sombra, contorno nem elemento gráfico,
e ela nunca aparece sobre bege.

## LGPD — o que já está implementado

- Banner de cookies com aceite granular (necessários / analíticos / marketing) e recusa em um clique.
- Cada escolha é gravada em `consentimentos_cookies` com a versão da política e hash do IP — prova de consentimento.
- Checkbox de aceite obrigatório em todo formulário que coleta dado pessoal.
- Portal do titular com protocolo, prazo de 15 dias calculado no banco e alerta no painel quando faltam menos de 5 dias.
- Botão de exclusão definitiva no painel (só perfil admin), registrado na trilha de auditoria.
- Trilha de auditoria de tudo que a equipe faz no painel.
- Prazos de retenção declarados na política e coerentes com o schema.

Falta o processo humano: definir quem é o Encarregado e criar o e-mail `privacidade@afirmaevias.com.br`.
