const requerido = (chave: string, padrao?: string) => {
  const valor = process.env[chave] ?? padrao;
  if (!valor) throw new Error(`Variavel de ambiente ausente: ${chave}`);
  return valor;
};

export const config = {
  ambiente: process.env.NODE_ENV ?? 'development',
  porta: Number(process.env.PORT ?? 3000),
  databaseUrl: requerido('DATABASE_URL'),
  sessionSecret: requerido('SESSION_SECRET', 'dev-secret-nao-use-em-producao'),
  siteUrl: process.env.SITE_URL ?? 'https://www.afirmaevias.com.br',
  admin: {
    email: process.env.ADMIN_EMAIL ?? '',
    senha: process.env.ADMIN_PASSWORD ?? '',
    nome: process.env.ADMIN_NOME ?? 'Administrador'
  },
  versaoPolitica: '2026-08-25',
  uploadMaximoBytes: 5 * 1024 * 1024
};

export const producao = config.ambiente === 'production';
