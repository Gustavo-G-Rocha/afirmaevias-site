# Contratos comuns do hipersistema

**Contrato planejado `AEVIAS-HIPERSISTEMA-1.0`.** Este capítulo é normativo para a implementação futura, não descreve APIs existentes. No repositório, sua cópia fica em `docs/hipersistema/contratos.md`. AUTH produzirá os schemas/OpenAPI e fixtures; RH implementará sua parte sem modificar o significado dos campos. Os demais usarão a mesma versão.

## C01. Identidade, pessoas e permissões

Identificadores são opacos e estáveis:

| Campo | Significado e tipo | Regra |
|---|---|---|
| `auth_user_id` / `sub` | UUID da identidade AUTH | Preservar os UUIDs GoTrue existentes; nunca usar e-mail como chave permanente |
| `person_id` | UUID do diretório mínimo RH | Pode representar funcionário, terceiro ou cliente externo; não significa contrato de trabalho |
| `employee_id` | UUID de `rh.employees` | Opcional no contexto; só para vínculo de funcionário; não criar empregados fictícios para clientes |
| `local_user_id` | ID original do perfil do app, como string | Preservar TEXT/ObjectId no Controle/Lab e UUID nos demais |
| `employment_id` | UUID de um episódio de vínculo | Distingue admissão, desligamento e eventual readmissão sem apagar episódios anteriores |
| `organizational_unit_id` | UUID RH | Departamento/filial/centro de custo; não substitui automaticamente obra/regional do Controle |
| `source_system`, `source_id` | Código do produtor e ID original | Obrigatórios nas projeções; unicidade composta |

`rh.persons` é um diretório mínimo proposto: `id`, `kind` (`employee`, `contractor`, `external`), `display_name`, `access_status` (`enabled`, `blocked`, `pending_review`), `access_version`, timestamps. `rh.identity_links` relaciona pessoa e `auth_user_id` por issuer, com unicidade de identidade ativa. `rh.employments` guarda vigências; `employees` mantém sua PK e ganha `person_id`. Identidade de funcionário sem ficha completa pode ser importada como pessoa `pending_review`, sem criar matrícula, salário ou admissão inventados.

Pessoas externas precisam de registro mínimo no RH para contexto, mas não ganham perfil/login no **aplicativo RH** nem acesso a folha. `rh.users` continua reservado a quem pode usar o RH. Toda pessoa autenticada num app deve ter vínculo central resolvido antes do cutover; perfis legados inativos podem permanecer sem vínculo, preservados como histórico.

Regra de acesso:

```text
permitir = AUTH conta/sessão ativas
       AND AUTH grant vigente para app
       AND RH pessoa/vínculo liberado para o app
       AND perfil local ativo
       AND permissão local para ação e objeto
       AND restrições funcionais RH aplicáveis
```

RH pode **reduzir** acesso imediatamente e fornecer papéis funcionais mapeados. Conceder uma nova capacidade exige mapeamento versionado e grant AUTH/perfil local correspondente. Nunca inferir administrador a partir de `cargo`, nome do departamento, e-mail, `user_metadata` ou papel de outro app. Férias e afastamento não equivalem automaticamente a desligamento; manter política explícita por vínculo.

### Migração dos vínculos

1. Exportar de cada dono por ferramenta somente leitura ou API de migração, contendo IDs e dados mínimos. Arquivos com nomes/e-mails ficam fora do Git e cifrados.
2. Dar preferência ao `auth_user_id` já existente e verificado. E-mail normalizado e confirmado pode sugerir um vínculo **apenas na migração**, nunca efetuar troca silenciosa em uma requisição normal.
3. Uma correspondência única e coerente vira vínculo; duplicidade, identidade discordante, e-mail reciclado e ausência de evidência viram `pending_review`. Não unir por nome, CPF, semelhança ou privilégio mais alto.
4. Registrar mapa reversível por origem/ID, motivo e hash do relatório. Não renumerar autoria/assinaturas.
5. Depois do corte, remover fallback por e-mail de todos os middlewares. Mudança de e-mail atualiza apresentação, não propriedade de registros.

## C02. Login central e sessão

### Decisão de implementação

Manter `aevias-auth` e os UUIDs/credenciais do GoTrue. Acrescentar no próprio repositório um servidor de autorização OIDC baseado em **`oidc-provider`**, com adapter Postgres persistente, tela de interação AUTH e configuração de produção. GoTrue fica como motor interno de credenciais durante esta evolução; somente AUTH conversa com ele. Não criar um protocolo OAuth artesanal nem um segundo repositório de identidade.

O repositório atual fixa GoTrue `v2.158.1` em parte das ferramentas: ele **não é tratado como servidor OIDC pronto**. A biblioteca deve ser fixada em versão suportada pelo Node escolhido e pelo lockfile após testes. Suporte OAuth do Supabase anunciado em documentação recente não deve ser presumido na imagem antiga nem adotado como dependência beta deste plano. A implementação do adapter e das interações é trabalho real do AUTH, coberto pelos gates A02/A03; instalar a biblioteca não conclui SSO.

O protocolo externo será Authorization Code + PKCE S256 e OIDC. Navegador usa BFF no próprio app; o BFF guarda tokens cifrados no banco do app e fornece cookie host-only `HttpOnly`, `Secure`, `SameSite=Lax`, nome `__Host-aevias_session`, `Path=/`, sem `Domain`. Armazenar somente hash do identificador de sessão, segredo aleatório de pelo menos 256 bits. Não armazenar access/refresh tokens em `localStorage`, querystring ou logs.

AUTH pode verificar credenciais pela interface interna GoTrue existente durante a transição; a senha só entra no domínio AUTH e nessa fronteira interna. Nenhum app recebe senha nem usa password grant. Se a implementação mantiver esse mecanismo interno legado, registrá-lo explicitamente como dívida limitada ao motor de credenciais, sem apresentá-lo como fluxo OAuth recomendado. Recuperação, troca de senha, convite e confirmação passam pela UI AUTH; não duplicar cadastro/senha em seis aplicações.

Configuração externa proposta:

- Issuer único HTTPS `AUTH_ISSUER_URL`; raiz pública do AUTH independente de gateway do Controle/Lab.
- Discovery `/.well-known/openid-configuration`; `authorization_endpoint`, `token_endpoint`, `jwks_uri`, `end_session_endpoint`, `revocation_endpoint` e `introspection_endpoint` obtidos da discovery; clientes não adivinham caminhos.
- Access tokens **opacos**, 5 minutos, audience de um único app. ID token assimétrico ES256 com `kid`, usado só no login; nunca aceito como access token de API.
- Código de autorização de uso único, até 60 segundos; `state`, `nonce`, PKCE obrigatórios; redirect URI exata registrada por ambiente, sem wildcard/retorno arbitrário.
- Sessão interativa máxima de 8 horas e inatividade de 30 minutos, renovação limitada à sessão, refresh rotativo com detecção de reuso. Salvar rascunho não contorna expiração.
- Logout global revoga sessão/grants de sessão e refresh no AUTH. Logout apenas do app encerra BFF e sua concessão de sessão. Remover grant do app não precisa apagar a identidade.
- Mudança de senha, bloqueio de conta ou incidente invalida todas as sessões centrais. Nada de senha padrão compartilhada na exposição à internet; exigir troca e MFA de administradores/operadores antes do corte.
- Atualizar MFA sem destruir evidências antigas de TOTP do Controle: novas ações sensíveis exigem `auth_time` recente (até 5 min) e fator forte; regras técnicas adicionais continuam locais. Não reduzir a proteção já existente durante a migração.

Clientes web: `rh-web`, `ponto-web`, `controle-web`, `laboratorio-web`, `institucional-web`. Códigos de app: `rh`, `ponto`, `controle`, `laboratorio`, `institucional`. AUTH é autoridade, não mais um app dependente do RH. Registrar clientes mobile distintos e sem segredo embarcado. Browser BFF pode autenticar cliente com chave privada registrada; não reutilizar a chave de assinatura do issuer.

### Mobile

Controle/Ponto usam navegador de sistema + PKCE; segredos e refresh ficam em armazenamento protegido do Android, não em bundle JavaScript. Retorno por App Link HTTPS verificado; URI privada somente quando tecnicamente necessária e testada com PKCE. Para o WebView remoto do Lab, usar fluxo externo e retorno ao backend do Lab; o backend entrega **um ticket próprio de uso único**, atrelado à transação/dispositivo, válido por no máximo 60 s, consumido por POST para estabelecer a sessão HttpOnly na WebView. Não colocar o token AUTH no deep link. Implementar e testar o transporte nativo desse ticket, incluindo replay, troca de servidor e perda do app durante login.

## C03. Comunicação interna e autorização online

TLS público e **mTLS entre serviços**. Cada aplicação/worker tem certificado e chave próprios, identidade SAN cadastrada no AUTH, CA privada e permissões explícitas por serviço. Chaves não entram em imagens/Git/front. Identidade vem da verificação TLS, nunca de um `X-App-Code` enviado pelo cliente. Se a borda terminar mTLS, a conexão dela até o backend também deve ser privada/autenticada e apagar cabeçalhos externos; preferir verificação no listener interno.

Registrar identidades separadas: `rh-api`, `rh-collector`, `<app>-api`, `<app>-worker`; conceder apenas operações necessárias. CA não pertence aos consumidores, emissão/renovação são administração da infraestrutura. Revogação/bloqueio do serviço é verificada no registro AUTH por chamada, mesmo que o certificado ainda não tenha expirado.

### AUTH `POST /v1/authorize` — proposto, listener interno

Cliente mTLS de aplicação envia:

```json
{
  "subject_token": "<access token opaco, somente em memória/transporte TLS>",
  "app_code": "controle",
  "request_id": "<UUID>"
}
```

AUTH verifica serviço chamador autorizado para `app_code`, token/access-session (não ID token), audience, expiração, revogação, conta/grant vigente e versão de segurança. Consulta o estado persistido a cada requisição; não confia em uma lista `apps` velha no token. `app_grants` transacionais no schema privado do AUTH são a fonte de concessões; `app_metadata.apps` vira somente espelho de compatibilidade durante a migração.

Resposta permitida:

```json
{
  "allowed": true,
  "subject": {"auth_user_id": "<UUID>", "session_id": "<ID>", "auth_time": "<RFC3339 UTC>", "amr": ["pwd", "mfa"]},
  "app_code": "controle",
  "access_version": 7,
  "request_id": "<UUID>"
}
```

Não retornar lista completa de aplicações, senha, hash, perfil RH ou dados de negócio. Respostas `Cache-Control: no-store`. Tokens/subject_token nunca aparecem no logger. Adapter consulta sessão do `oidc-provider` e estado próprio sem ler/alterar internals por suposição; fixar o contrato do adapter por testes. Revalidação só criptográfica não satisfaz C03.

### AUTH `POST /v1/service-authorize`

Para workers, endpoints públicos e chamadas sem usuário: mTLS + `{app_code, capability, request_id}`. Verificar se a identidade técnica está ativa e se aquela capacidade/target foi concedida. Retornar `{allowed, service_id, app_code, policy_version}`. **Nunca** transformar resposta de serviço em identidade humana; endpoints humanos rejeitam credencial técnica. Uma chamada feita pelo coletor RH só pode ler projeções explicitamente autorizadas.

### RH `POST /api/integracao/v1/context`

O app envia o mesmo `subject_token`, `app_code` e `request_id` por mTLS. RH verifica que o chamador corresponde ao app, pede autorização ao AUTH e resolve seu diretório **no próprio banco**. AUTH permite ao serviço `rh-api` introspectar token de outro app somente para a operação de contexto; RH deve vincular audience ao chamador mTLS original. Não encaminhar token do Controle para APIs normais de folha RH.

Resposta mínima:

```json
{
  "person_id": "<UUID>",
  "auth_user_id": "<UUID>",
  "employee_id": null,
  "employment_id": null,
  "person_kind": "external",
  "access_status": "enabled",
  "functional_roles": [],
  "organization_scope": [],
  "policy_version": 3,
  "access_version": 9,
  "effective_at": "<RFC3339 UTC>",
  "request_id": "<UUID>"
}
```

External pode receber contexto sem matrícula/emprego; cabe ao perfil local permitir acesso de cliente. Para funcionário, IDs funcionais são preenchidos quando disponíveis. Salário, ASO, holerite, nascimento, CPF, endereço, GPS e selfie ficam fora. Nome de apresentação pode ser solicitado por endpoint separado com escopo, não é necessário para decidir acesso.

### RH `POST /api/integracao/v1/service-context`

Verifica mTLS, AUTH serviço e configuração local do consumidor; devolve `{enabled, app_code, policy_version}`. Não chama produtor/worker nem exige pessoa. Usado por exportadores, tarefas de sistema e páginas públicas. Evita criar funcionários para visitantes e não permite acesso amplo aos dados RH.

### Consulta e diretório

`GET /api/integracao/v1/persons/:person_id` e `GET /api/integracao/v1/organization-units`: somente projeções permitidas ao chamador, com paginação e minimização. Consultas de pessoas em lote: máximo 100 IDs, sem enumeração irrestrita por qualquer app. Cada operação de serviço também passa pelo AUTH. Pessoas bloqueadas podem aparecer em consultas históricas autorizadas; não podem voltar a operar.

## C04. Dependência real, saúde e falhas

Todo endpoint de negócio humano: AUTH online → RH online → perfil/regras locais → negócio/banco local. Consulta ao perfil para negar/autorizar vem depois dos dois serviços centrais; validação sintática barata pode acontecer antes. RH exige apenas AUTH e seu banco; AUTH exige apenas seus componentes internos. Não chamar RH recursivamente do middleware do próprio RH.

| Endpoint | Verifica | Pode atender com core indisponível? |
|---|---|---|
| `/health/live` | Processo/event loop, sem rede | Sim; não revela dados |
| `/health/ready` AUTH | Banco, provider e motor de credenciais necessários | Não, se suas dependências falharem |
| `/health/ready` RH | Banco + AUTH; migrations/contrato compatíveis | Não; produtores/coletor não entram |
| `/health/ready` app | Banco próprio + AUTH + RH + versão de contrato | Não |
| API humana de app | Sessão/grant AUTH + contexto RH + autorização local | Não |
| API exportadora/worker | Serviço AUTH + service-context RH + permissão da projeção | Não |
| HTML/formulários públicos Institucional e verificação pública de documentos | AUTH service-authorize + RH service-context + limites públicos | Não; visitante não é obrigado a fazer login |
| Assets sem dados, login/recuperação AUTH, manutenção, health | Exceção operacional explícita | Sim, conforme dependências próprias |

Os processos podem continuar vivos mostrando manutenção e preservando filas; isso **não** equivale a permitir funcionamento de negócio. Não matar containers em cascata, não criar reinício infinito e não usar readiness como liveness. Ao recuperar, revalidar dependências/contrato antes de liberar tráfego.

Sem cache positivo de autorização ou de status funcional entre requisições na v1. Compartilhar o resultado somente dentro da mesma requisição; diretório de apresentação pode ter cache separado e jamais autoriza. Timeouts iniciais internos: conexão 500 ms, total 2 s por chamada, orçamento de core até 6 s por requisição (AUTH direto, RH, AUTH dentro do RH). Medir e reduzir na homologação; limitar concorrência. Circuit breaker abre após 5 falhas de infraestrutura em 10 s, testa recuperação após 5 s; aberto responde 503, nunca permite por cache. Sem retries cegos de mutação. Retry somente para consulta segura, dentro do orçamento, ou operação com chave de idempotência.

Revogação confirmada impede a **próxima decisão de autorização**. Uma transação já autorizada/em voo não pode ser magicamente desfeita: operações sensíveis revalidam imediatamente antes da mutação, com chamada remota fora de locks longos. Registrar `authorized_at` e versão usados. SSE/streams revalidam no máximo a cada 5 s e encerram em bloqueio/falha/expiração. Testar corrida de desligamento; não prometer linearização distribuída de todas as transações.

### Erros padronizados

```json
{"error":"Serviço central indisponível. Tente novamente.","code":"core_unavailable","errorCategory":"network","request_id":"<UUID>","retryable":true}
```

| HTTP | `code` | Cliente |
|---:|---|---|
| 401 | `session_invalid`, `session_expired`, `session_revoked` | Renovar uma vez se apropriado; senão login AUTH; preservar rascunhos/fila |
| 403 | `app_not_allowed`, `person_blocked`, `user_not_registered`, `scope_denied` | Bloquear operação; não tentar outro login/provedor como contorno; preservar trabalho pendente |
| 409 | `version_conflict`, `idempotency_conflict`, `identity_conflict` | Resolver conforme contrato, sem sobrescrever automaticamente |
| 429 | `rate_limited` | Respeitar `Retry-After`, sem descartar fila |
| 503 | `core_unavailable`, `dependency_contract_mismatch` | Pausar sync e mostrar indisponibilidade; não limpar sessão por falha de rede |
| 410 | `cursor_expired` | Coletor inicia novo snapshot/reconciliação, nunca assume que não houve mudanças |

Manter `errorCategory` compatível com o enum atual do Controle/Lab: `permission`, `schema`, `network`, `conflict`, `totp_required`, `totp_invalid`, `unknown`; validação usa `schema`, sem inventar categoria incompatível. Novos códigos específicos não mudam um erro de infraestrutura para 4xx. No Lab/Controle, não descartar 401/403/429 da fila como erro permanente genérico.

## C05. Desligamento, roles e preservação

Operação proposta RH `POST /api/lifecycle/offboard`, requer usuário RH/admin autorizado, sessão recente/MFA, `Idempotency-Key`, `{person_id, employment_id, effective_at, reason_code}`. Código de motivo enumerado, sem justificativa íntima no evento geral.

1. RH grava transacionalmente: fim do vínculo, `person.access_status=blocked`, incremento `access_version`, auditoria e outbox `identity.access.blocked.v1`. Desligamento futuro é agendado; não bloquear antes da vigência. Horário da decisão fica em UTC, data civil segue São Paulo.
2. Toda nova requisição aos consumidores já será recusada pelo contexto RH. A UI mostra bloqueio funcional e estado da revogação central separado; não informar conclusão total antes da confirmação AUTH.
3. RH chama comando restrito AUTH `POST /v1/lifecycle/block-user`, idempotente e mTLS, com `auth_user_id`, ID da operação, versão e vigência. AUTH bloqueia conta, revoga todas as sessões/refresh e registra auditoria. Concessões são suspensas/preservadas como histórico; não apagar usuário nem sua lista histórica.
4. Se AUTH cair, apps já estão fail-closed. Outbox RH repete até confirmação; recuperar AUTH não libera o ex-funcionário porque RH continua bloqueando. Expor atraso de revogação como alerta, com tentativas/backoff/DLQ e replay administrativo.
5. Consumidores recebem estado na consulta síncrona e, posteriormente, evento para suspender perfil/sessões locais. Esse evento melhora convergência, não é o único mecanismo de bloqueio.
6. Nunca executar delete cascade de usuário, pessoa, marcação, diário, certificado, avaliação, assinatura ou trabalho em andamento. Manter autoria anterior e histórico de permissões. Transferência de responsabilidade é evento explícito; não reescrever criador.
7. Pendências offline pertencem ao autor original. Após bloqueio, ficam em quarentena local; um fluxo administrativo auditado permite recuperar/importar como material pendente, sem impersonar o ex-funcionário ou emitir assinatura em nome dele. Preservar horário declarado/origem e distinguir importação de confirmação original.
8. Readmissão cria novo episódio de vínculo. Reativar conta é comando explícito, com novas sessões; grants/papéis antigos não voltam automaticamente. Bloqueios de segurança/legais não são removidos pela readmissão.

Gerenciar role funcional usa operação versionada `PATCH /api/lifecycle/role-assignments` com `If-Match` e auditoria. Rebaixamento vale na próxima consulta sem esperar expirar JWT. RH só pode conceder capacidades de sua allowlist; `global_admin`, emissão de certificados, CA, chaves e administração do AUTH não são papéis distribuídos automaticamente.

## C06. Coleta de informações e dados futuros de produtividade

O RH coleta **projeções por APIs** dos produtores. Não usa `dblink`, FDW, consultas federadas, acesso SQL cruzado, scraping de tela, conexão Power BI a todos os bancos ou credencial de administrador global. Worker de coleta separado do core e com pools/concurrency próprios; falha de um produtor vira `stale` apenas naquela origem.

### Feed de mudanças padrão — a implementar pelos quatro produtores

`GET /api/integracao/v1/changes?cursor=<opaco>&limit=500` por mTLS `rh-collector`. Limite máximo 1000; ordenação estável, paginação keyset e campos allowlist. Resposta `{items, next_cursor, has_more, high_watermark, generated_at, schema_version}`. Cursor assinado/opaco inclui produtor/stream/filtros/versão; consumidor não o constrói nem usa datas da atividade como cursor.

Envelope:

```json
{
  "event_id": "<UUID>",
  "source_system": "ponto",
  "stream": "workforce_activity",
  "sequence": "1042",
  "event_type": "ponto.punch.recorded.v1",
  "schema_version": 1,
  "source_id": "<ID original como string>",
  "aggregate_id": "<ID do objeto>",
  "aggregate_version": 1,
  "person_id": "<UUID ou null se ainda não resolvido>",
  "actor_auth_user_id": "<UUID ou null para sistema>",
  "occurred_at": "2026-10-21T12:00:00Z",
  "recorded_at": "2026-10-21T12:05:00Z",
  "effective_date": "2026-10-21",
  "operation": "upsert",
  "payload": {"status":"valid","type":"in","source":"app"},
  "trace_id": "<UUID>"
}
```

`sequence` é string decimal para não perder precisão de bigint no JavaScript. `actor` é quem realizou a ação, `person_id` é a pessoa a quem o fato se refere; podem ser diferentes. Não atribuir aprovação do supervisor ao executor do ensaio. `null` não é descarte: RH mantém pendência de vinculação e reprocessa após resolução.

A alteração de domínio e o outbox devem ser gravados **na mesma transação**; eventos só incluem dados permitidos. Para garantir que o cursor não salte transações que confirmem atrasadas, usar contador de sequência por stream atualizado sob row lock na mesma transação e mantido até commit. `BIGSERIAL` ou `(updated_at,id)` isolados **não garantem ordem de commit**. Se o lock virar gargalo medido, implementar publicação serializada/CDC com cursor de commit equivalente, preservando contrato; não trocar silenciosamente por timestamp.

Entregar pelo menos uma vez. No RH: `integration_inbox UNIQUE(source_system,event_id)`, projeção versionada e checkpoint do consumidor na **mesma transação local**. Confirmar checkpoint depois de persistir todo o lote; crash/replay não duplica fatos. Não avançar checkpoint além de erro não tratado: armazenar inbox em quarentena, com estado e posição reprocessáveis, antes de avançar o transporte. Métricas distinguem recebido, aplicado e pendente.

Backoff 1, 2, 4, 8, 16, 30 e 60 segundos com jitter; depois tenta a cada minuto. Erro de schema vai para quarentena; erro de infraestrutura não vira descarte. Limitar 2 chamadas concorrentes por origem inicialmente, coletar a cada 30 s, lotes 500. Expor idade do último evento aplicado, filas e último sucesso. Objetivo inicial de frescor: até 2 minutos com origens saudáveis, medido, não garantia histórica.

### Bootstrap, mudanças e exclusões

- `POST /api/integracao/v1/snapshots` cria exportação mínima consistente e devolve `snapshot_id`, cursor H e expiração. Páginas imutáveis, autenticadas, tamanho limitado; somente metadados permitidos, nunca dump genérico.
- Construir snapshot a partir de uma visão MVCC consistente que inclua os dados e o watermark comprometido; todos os novos eventos entram após H. RH carrega snapshot em staging e aplica feed depois de H, depois troca projeção. Não executar snapshot e delta com janelas descoordenadas.
- Atualização/aprovação/cancelamento gera novo evento/version, mesmo se a atividade for antiga. Não usar só `punched_at` para Ponto nem só `created_at` para outros apps.
- Exclusão autorizada gera tombstone `operation=delete` sem conteúdo pessoal; preservar informação técnica mínima contra ressurreição indevida em restore/replay. Desligamento não gera tombstone dos trabalhos.
- Endpoint de reconciliação `GET /api/integracao/v1/reconciliation` devolve contagens/digests por partição, período e versão. Não expor hashes previsíveis de CPF/e-mail.
- Feed terá retenção técnica configurável, inicialmente 90 dias em homologação; produção exige compatibilidade com retenção dos dados exportados. Cursor antigo recebe 410 e resnapshot. Não eliminar automaticamente a evidência original por esse prazo de transporte.

### Projeções mínimas iniciais

| Origem | Feed/eventos | Projeção no RH | Excluído por padrão |
|---|---|---|---|
| Ponto | `ponto.punch.recorded.v1`, `ponto.punch.status_changed.v1`, `ponto.timesheet.revised.v1` | Batidas mínimas e jornada calculada por competência, origem e versão | CPF, GPS, selfie, QR, device fingerprint, texto de justificativa |
| Controle | `controle.record.created.v1`, `controle.record.state_changed.v1`, `controle.assignment.changed.v1` | Tipo/ID, executor/ator distintos, obra/regional mapeadas, estado, datas; revisão de progresso | Documento técnico completo, fotos, evidência de assinatura, texto livre |
| Laboratório | `laboratorio.test.state_changed.v1`, `laboratorio.certificate.issued.v1`, `laboratorio.certificate.revised.v1`, `laboratorio.competence.changed.v1` | Execução, revisão, competência e treinamento mínimos vinculados à pessoa | Laudos, certificados integrais, dados de cliente, CPF/endereço da ficha |
| Institucional | `institucional.application.received.v1`, `institucional.application.status_changed.v1`, `institucional.admin_action.recorded.v1` | Candidatura mínima autorizada e atividade administrativa por categoria | Relatos de integridade, portal de titular, IP, currículo binário, cookies de visitantes |

Não duplicar KPIs por simples contagem de eventos: criação e mudança de status de um mesmo objeto não são dois trabalhos concluídos. Projeção de estado atual guarda maior `aggregate_version`; histórico guarda eventos únicos. Correção cria nova versão, não reescreve fatos originais. Definir datas de execução, recebimento e competência separadamente. Cada dimensão org guarda vigência para relatório não aplicar o departamento de hoje a todo o passado.

## C07. Contratos de comandos e provisionamento

Comandos mutáveis de integração usam `Idempotency-Key` de até 128 caracteres, identificada por `(service_id,route,key)`, hash canônico do corpo e resposta persistida. Mesma chave/corpo devolve resposta anterior; mesmo identificador com corpo diferente retorna 409. Persistir chave e mutação juntos. Prazo técnico padrão 7 dias para operações comuns; manter identificador de operação de desligamento/provisionamento enquanto durar seu histórico, pois pode ser repetido depois.

Provisionamento é uma saga explícita:

1. Pessoa/vínculo mínimo no RH ou pessoa externa identificada.
2. Identidade AUTH existente ou convite seguro criado pelo AUTH.
3. Vínculo entre identidade e pessoa confirmado.
4. Perfil do app criado por comando autorizado no próprio app, em estado pendente.
5. Grant AUTH do app concedido e perfil ativado, conforme permissão solicitante. Reconciliar se uma etapa falhar; até o fim a interseção nega acesso.

Nenhum login auto-provisiona perfil administrativo. App não escreve grant de outro app. Concessões são serializadas/transacionais no AUTH; abandonar ler-alterar-gravar `app_metadata.apps` sem controle de concorrência. Administração usa API restrita; `service_role` GoTrue e chave HS256 nunca saem do AUTH na arquitetura final.

### Inicialização sem dependência circular

AUTH inicializa seu operador e registro de serviços independentemente do RH, pelo procedimento A05. Para um RH vazio, entregar CLI de inicialização de administrador que usa identidade AUTH verificada e capacidade técnica temporária `rh.bootstrap`, limitada à instalação e consumida uma única vez. A CLI cria pessoa mínima, vínculo de identidade e perfil RH administrativo na mesma transação local; registra o grant do app RH pela API administrativa AUTH e mantém estado pendente até a confirmação. Não cria emprego/salário fictício, não usa uma senha local e não oferece endpoint público de autoatribuição de admin.

Em RH já populado, preservar administradores existentes e validar seus vínculos AUTH, sem promover admins do Ponto. A inicialização recusa execução se já houver administrador vinculado, salvo recuperação operacional explícita auditada. Revogar a capacidade de bootstrap após conclusão; os logins seguintes obedecem ao fluxo normal. Outras pessoas/grants usam a saga acima. Testes provam instalação vazia, retomada após timeout e recusa de repetição ou identidade diferente.

## C08. Offline sem contorno do core

Não existe revogação remota instantânea em aparelho sem rede. A v1 mantém **captura provisória** e rascunhos locais dos fluxos que já são offline, ligados à última identidade conhecida. Isso não é autorização para leitura sensível nova, aprovar, assinar, calcular resultado oficial ou confirmar gravação no servidor.

- Separar autenticação online de desbloqueio local do dispositivo. Nenhum JWT de 365 dias será usado como passe de API.
- Identificar filas por `issuer`, `auth_user_id`, `person_id`, perfil original, instalação e ID da operação. Troca de conta/issuer/ambiente não envia fila do dono anterior.
- Em offline, mostrar “pendente de validação/sincronização”; não emitir NSR/comprovante definitivo ou assinatura validada.
- Ao voltar, consultar AUTH e RH antes de upload/sync e novamente nas operações sensíveis. 503 pausa; 401 pede reautenticação; 403 de desligamento preserva e bloqueia fila para recuperação administrativa.
- Desligamento nunca limpa IndexedDB/arquivos nativos automaticamente. Logout remove credenciais e impede outra pessoa de ler o trabalho pendente; a recuperação usa controle local/nativo e exportação cifrada, não botão que exponha dados sem autenticação.
- PWA não oferece a mesma proteção de armazenamento de uma aplicação nativa: documentar limite, minimizar conteúdo e restringir cache; usar chave não extraível onde viável e testar recuperação. Não prometer que uma chave acessível ao mesmo JavaScript protege contra XSS.
- A primeira migração deve preservar a fila existente antes de mudar nomes de stores, versão ou identidade; executar migração idempotente e teste com queda no meio. Nenhuma atualização de service worker apaga pendências.

## C09. Versionamento, compatibilidade e evidência

AUTH mantém `contracts/v1/` (a criar): OpenAPI 3.1 de AUTH, RH e feeds, JSON Schemas, erros, fixtures sintéticas, cenários de contrato e manifest com SHA-256. RH é responsável pela semântica da sua API, mas implementa a versão já congelada. Essa organização não autoriza AUTH a ler banco RH. Cópias do bundle ficam versionadas nos consumidores; não usar `file:../aevias-auth`, import de diretório irmão ou download flutuante em runtime.

Cada release publica `contract_version`, hash e capacidades em `/internal/capabilities` autenticado. Mudança aditiva mantém v1; mudança incompatível cria v2 com período explícito de coexistência. Consumidor recusa versão incompatível em readiness. Não comparar apenas texto `1.0`: executar contract tests consumidor/provedor.

Aplicativos mantêm clocks sincronizados, timestamps RFC3339 UTC, datas civis `YYYY-MM-DD` e fuso de negócio `America/Sao_Paulo`. Usar request/trace ID aleatório sem dados pessoais. Métricas não usam nomes/e-mails como labels. Auditoria técnica registra IDs necessários sob acesso controlado; eventos de produtividade não reutilizam logs de navegação como se fossem produção.

## C10. Referências técnicas verificadas

As escolhas do projeto acima são decisões deste planejamento. As referências sustentam os mecanismos, não comprovam que o código atual já os implementa:

- [RFC 9700 — segurança OAuth](https://www.rfc-editor.org/rfc/rfc9700.html): base para fluxo por código/PKCE e retirada de password grant dos consumidores.
- [oidc-provider — implementação OIDC para Node](https://github.com/panva/node-oidc-provider): biblioteca escolhida, a configurar com persistência e interações reais; sua certificação não certifica a implantação AEVIAS.
- [RFC 7662 — introspecção](https://www.rfc-editor.org/rfc/rfc7662.html): consulta de estado de token; `v1/authorize` acrescenta políticas específicas AEVIAS.
- [RFC 8252 — aplicativos nativos](https://www.rfc-editor.org/rfc/rfc8252.html): autenticação via navegador externo e PKCE para mobile.
- [Supabase OAuth Server](https://supabase.com/docs/guides/auth/oauth-server/getting-started): documentação consultada apresenta o recurso como beta; não é evidência de suporte na imagem antiga do repositório.
- [PostgreSQL — privilégios](https://www.postgresql.org/docs/16/ddl-priv.html): base para roles e revogação de permissões padrão. [Docker Compose — startup](https://docs.docker.com/compose/how-tos/startup-order/): ordem/health inicial não substituem autorização contínua.
