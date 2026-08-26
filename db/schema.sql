-- Afirma E-vias | schema do site institucional
-- Executado de forma idempotente pelo src/migrate.ts a cada deploy.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------- usuarios
CREATE TABLE IF NOT EXISTS admin_usuarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT        NOT NULL,
  email           TEXT        NOT NULL UNIQUE,
  senha_hash      TEXT        NOT NULL,
  papel           TEXT        NOT NULL DEFAULT 'editor',
  ativo           BOOLEAN     NOT NULL DEFAULT TRUE,
  ultimo_acesso   TIMESTAMPTZ,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessoes (
  token           TEXT PRIMARY KEY,
  usuario_id      UUID        NOT NULL REFERENCES admin_usuarios(id) ON DELETE CASCADE,
  ip              TEXT,
  user_agent      TEXT,
  expira_em       TIMESTAMPTZ NOT NULL,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessoes_expira ON admin_sessoes (expira_em);

-- ------------------------------------------------------------- formularios
CREATE TABLE IF NOT EXISTS contatos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT        NOT NULL,
  sobrenome       TEXT,
  email           TEXT        NOT NULL,
  telefone        TEXT,
  empresa         TEXT,
  assunto         TEXT,
  mensagem        TEXT        NOT NULL,
  origem          TEXT        NOT NULL DEFAULT 'home',
  status          TEXT        NOT NULL DEFAULT 'novo',
  observacao      TEXT,
  consentimento   BOOLEAN     NOT NULL DEFAULT FALSE,
  ip              TEXT,
  user_agent      TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contatos_criado ON contatos (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_contatos_status ON contatos (status);

CREATE TABLE IF NOT EXISTS candidaturas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT        NOT NULL,
  sobrenome       TEXT,
  email           TEXT        NOT NULL,
  telefone        TEXT,
  area            TEXT,
  mensagem        TEXT,
  arquivo_nome    TEXT,
  arquivo_tipo    TEXT,
  arquivo_bytes   INTEGER,
  arquivo_dados   BYTEA,
  status          TEXT        NOT NULL DEFAULT 'novo',
  observacao      TEXT,
  consentimento   BOOLEAN     NOT NULL DEFAULT FALSE,
  ip              TEXT,
  user_agent      TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_candidaturas_criado ON candidaturas (criado_em DESC);

-- Relato de integridade. Pode ser anonimo: email/nome sao opcionais.
-- O protocolo e o unico dado que o relator leva embora.
CREATE TABLE IF NOT EXISTS relatos_integridade (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo       TEXT        NOT NULL UNIQUE,
  titulo          TEXT        NOT NULL,
  relato          TEXT        NOT NULL,
  categoria       TEXT,
  anonimo         BOOLEAN     NOT NULL DEFAULT TRUE,
  nome            TEXT,
  email           TEXT,
  status          TEXT        NOT NULL DEFAULT 'recebido',
  resposta        TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------- LGPD
-- Requisicoes de titular (art. 18 da Lei 13.709/2018)
CREATE TABLE IF NOT EXISTS solicitacoes_lgpd (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo       TEXT        NOT NULL UNIQUE,
  tipo            TEXT        NOT NULL,
  nome            TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  documento       TEXT,
  detalhes        TEXT,
  status          TEXT        NOT NULL DEFAULT 'recebida',
  resposta        TEXT,
  respondida_em   TIMESTAMPTZ,
  prazo_em        TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '15 days'),
  ip              TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lgpd_status ON solicitacoes_lgpd (status, prazo_em);

-- Prova de consentimento de cookies (guardamos so o hash do IP)
CREATE TABLE IF NOT EXISTS consentimentos_cookies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitante_id    TEXT        NOT NULL,
  necessarios     BOOLEAN     NOT NULL DEFAULT TRUE,
  analiticos      BOOLEAN     NOT NULL DEFAULT FALSE,
  marketing       BOOLEAN     NOT NULL DEFAULT FALSE,
  versao_politica TEXT        NOT NULL,
  ip_hash         TEXT,
  user_agent      TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_consent_visitante ON consentimentos_cookies (visitante_id, criado_em DESC);

-- ----------------------------------------------------------------- auditoria
CREATE TABLE IF NOT EXISTS auditoria (
  id              BIGSERIAL PRIMARY KEY,
  usuario_id      UUID REFERENCES admin_usuarios(id) ON DELETE SET NULL,
  usuario_email   TEXT,
  acao            TEXT        NOT NULL,
  entidade        TEXT,
  entidade_id     TEXT,
  detalhes        JSONB,
  ip              TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado ON auditoria (criado_em DESC);
