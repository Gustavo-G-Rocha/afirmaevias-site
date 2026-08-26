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

## O que falta você colocar

- **Logos oficiais.** `public/img/logo-horizontal.svg` e `logo-vertical-claro.svg` são placeholders.
  O manual proíbe alteração da logo, então substitua pelos arquivos originais mantendo os nomes.
- **PDFs.** `public/documentos/certificado-iso-9001.pdf` e `codigo-de-etica-e-conduta.pdf`
  (instruções em `public/documentos/LEIA-ME.txt`).
- **Imagens de obra.** O layout hoje é tipográfico e funciona sem fotos. Se quiser fotos,
  siga a tela "Fotografia" do manual: pontos de cor azulados ou esverdeados.
- **Envio de e-mail.** Os formulários gravam no banco e aparecem no `/admin`. Se quiser
  notificação por e-mail, plugue Resend ou SMTP em `src/routes/forms.ts`.
- **CNPJ** na política de privacidade (`src/content.ts`, seção 1).

## Decisões de marca

Paleta e tipografia vêm direto do Manual de Marca v1.0: `#00233B`, `#566E3D`, `#BFCF99`,
`#EFEBDC`, `#F2F1EF`, `#FFFFFF`; Exo para títulos e rótulos, Poppins para texto corrido.

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
