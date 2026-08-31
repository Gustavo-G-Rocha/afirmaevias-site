import crypto from 'node:crypto';

const requerido = (chave: string, padrao?: string) => {
  const valor = process.env[chave] ?? padrao;
  if (!valor) throw new Error(`Variavel de ambiente ausente: ${chave}`);
  return valor;
};

// O Railway injeta RAILWAY_ENVIRONMENT_NAME em todo deploy: serve de sinal de
// producao sem exigir NODE_ENV configurado a mao no painel.
const noRailway = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME ?? process.env.RAILWAY_ENVIRONMENT);
const ambiente = process.env.NODE_ENV ?? (noRailway ? 'production' : 'development');

// Sem SESSION_SECRET o segredo e sorteado a cada boot: as sessoes do painel
// caem a cada redeploy, mas nenhum ambiente assina cookie com valor publicado.
// O sorteio e a opcao menos ruim, nao a correta - por isso o aviso abaixo, para
// a consequencia aparecer no log em vez de virar "o painel me desloga sozinho".
const segredoSessao =
  process.env.SESSION_SECRET ??
  (ambiente === 'production' ? crypto.randomBytes(32).toString('hex') : 'dev-secret-nao-use-em-producao');

if (!process.env.SESSION_SECRET && ambiente === 'production') {
  console.warn(
    '[atencao] SESSION_SECRET nao configurada. Um segredo aleatorio foi gerado para este boot, ' +
      'entao todo mundo que estiver no /admin sera deslogado no proximo deploy. ' +
      'Defina a variavel no painel do Railway: openssl rand -hex 32'
  );
}

export const config = {
  ambiente,
  porta: Number(process.env.PORT ?? 3000),
  databaseUrl: requerido('DATABASE_URL'),
  sessionSecret: segredoSessao,
  siteUrl: process.env.SITE_URL ?? 'https://www.afirmaevias.com.br',
  admin: {
    email: process.env.ADMIN_EMAIL ?? '',
    senha: process.env.ADMIN_PASSWORD ?? '',
    nome: process.env.ADMIN_NOME ?? 'Administrador'
  },
  versaoPolitica: '2026-08-25',
  uploadMaximoBytes: 5 * 1024 * 1024
};

export const producao = ambiente === 'production';
