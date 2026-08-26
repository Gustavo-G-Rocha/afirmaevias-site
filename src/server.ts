import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import estatico from '@fastify/static';
import view from '@fastify/view';
import rateLimit from '@fastify/rate-limit';
import ejs from 'ejs';
import { config, producao } from './config.js';
import * as conteudo from './content.js';
import { pool } from './db.js';
import { limparSessoesExpiradas } from './auth.js';
import { rotasSite } from './routes/site.js';
import { rotasFormularios } from './routes/forms.js';
import { rotasAdmin } from './routes/admin.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({
  logger: producao ? true : { transport: undefined },
  trustProxy: true,
  bodyLimit: config.uploadMaximoBytes + 1024 * 512
});

await app.register(cookie, { secret: config.sessionSecret });
await app.register(formbody);
await app.register(multipart, { limits: { fileSize: config.uploadMaximoBytes, files: 1 } });
await app.register(rateLimit, { global: false, max: 20, timeWindow: '10 minutes' });

await app.register(estatico, {
  root: path.resolve(aqui, '../public'),
  prefix: '/',
  maxAge: producao ? '7d' : 0
});

await app.register(view, {
  engine: { ejs },
  root: path.resolve(aqui, 'views'),
  viewExt: 'ejs',
  defaultContext: {
    siteUrl: config.siteUrl,
    navegacao: conteudo.navegacao,
    empresa: conteudo.empresa,
    cookiesCategorias: conteudo.cookies.categorias
  }
});

app.addHook('onSend', async (_req, reply, payload) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'SAMEORIGIN');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  if (producao) reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return payload;
});

app.get('/health', async () => {
  await pool.query('SELECT 1');
  return { ok: true, ambiente: config.ambiente };
});

await app.register(rotasSite);
await app.register(rotasFormularios);
await app.register(rotasAdmin, { prefix: '/admin' });

app.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith('/admin')) {
    return reply.code(404).view('admin/404', { titulo: 'Página não encontrada', usuario: null });
  }
  return reply.code(404).view('pages/404', {
    titulo: 'Página não encontrada',
    descricao: 'O endereço que você acessou não existe.',
    rotaAtual: ''
  });
});

app.setErrorHandler((erro: any, request, reply) => {
  request.log.error(erro);
  const status = erro?.statusCode && erro.statusCode < 500 ? erro.statusCode : 500;
  return reply.code(status).view('pages/erro', {
    titulo: 'Algo quebrou aqui',
    descricao: 'Tivemos um problema ao carregar esta página.',
    rotaAtual: '',
    mensagem: status === 500 ? 'Erro interno do servidor.' : erro.message
  });
});

setInterval(() => {
  limparSessoesExpiradas().catch(() => {});
}, 60 * 60 * 1000).unref();

try {
  await app.listen({ port: config.porta, host: '0.0.0.0' });
  console.log(`site no ar em http://0.0.0.0:${config.porta}`);
} catch (erro) {
  app.log.error(erro);
  process.exit(1);
}
