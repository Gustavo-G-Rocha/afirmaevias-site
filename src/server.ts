import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import compress from '@fastify/compress';
import estatico from '@fastify/static';
import view from '@fastify/view';
import rateLimit from '@fastify/rate-limit';
import ejs from 'ejs';
import { config, producao } from './config.js';
import * as conteudo from './content.js';
import { pool } from './db.js';
import { limparSessoesExpiradas } from './auth.js';
import { aplicarRetencao } from './retencao.js';
import { asset } from './assets.js';
import { dadosEstruturados } from './seo.js';
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
// texto ia sem compressao nenhuma: o CSS cai de 43 KB para 8 KB em brotli
await app.register(compress, { encodings: ['br', 'gzip'], threshold: 1024 });
await app.register(multipart, { limits: { fileSize: config.uploadMaximoBytes, files: 1 } });
await app.register(rateLimit, { global: false, max: 20, timeWindow: '10 minutes' });

await app.register(estatico, {
  root: path.resolve(aqui, '../public'),
  prefix: '/',
  maxAge: producao ? '365d' : 0
});

await app.register(view, {
  engine: { ejs },
  root: path.resolve(aqui, 'views'),
  viewExt: 'ejs',
  defaultContext: {
    siteUrl: config.siteUrl,
    navegacao: conteudo.navegacao,
    empresa: conteudo.empresa,
    cookiesCategorias: conteudo.cookies.categorias,
    asset,
    dadosEstruturados
  }
});

app.addHook('onSend', async (req, reply, payload) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'SAMEORIGIN');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // O site nao usa CDN, fonte externa nem analytics: da para fechar tudo.
  // 'unsafe-inline' fica so em style-src por causa do --heroi-imagem no
  // atributo style. Uma rota abre excecao para o player de video e recebe
  // politica propria, em vez de afrouxar o cabecalho de todas as paginas.
  const base =
    "default-src 'self'; style-src 'self' 'unsafe-inline'; " +
    "font-src 'self'; connect-src 'self'; form-action 'self'; " +
    "frame-ancestors 'self'; base-uri 'self'; object-src 'none'";
  const comVideo = req.url.startsWith('/bruno_magalhaes');
  reply.header(
    'Content-Security-Policy',
    comVideo
      ? `${base}; script-src 'self' https://www.youtube.com https://s.ytimg.com; ` +
        "img-src 'self' data: https://i.ytimg.com; " +
        'frame-src https://www.youtube.com https://www.youtube-nocookie.com'
      : `${base}; img-src 'self' data:; script-src 'self'`
  );
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
  // O plugin de limite formata o tempo em ingles ("9 minutes"), entao a espera
  // e remontada a partir do retry-after, que vem em segundos.
  const segundos = Number(reply.getHeader('retry-after')) || 0;
  const espera =
    segundos >= 60
      ? `${Math.ceil(segundos / 60)} minuto${Math.ceil(segundos / 60) > 1 ? 's' : ''}`
      : `${segundos || 60} segundos`;
  const conhecidos: Record<number, string> = {
    413: 'O arquivo enviado passou do tamanho permitido.',
    429: `Muitas tentativas em pouco tempo. Tente de novo em ${espera}.`,
    400: 'Os dados enviados não foram aceitos. Confira o formulário e tente de novo.'
  };
  return reply.code(status).view('pages/erro', {
    titulo: status === 429 ? 'Devagar aí' : 'Algo quebrou aqui',
    descricao: 'Tivemos um problema ao carregar esta página.',
    rotaAtual: '',
    mensagem: conhecidos[status] ?? (status === 500 ? 'Erro interno do servidor.' : erro.message)
  });
});

setInterval(() => {
  limparSessoesExpiradas().catch(() => {});
}, 60 * 60 * 1000).unref();

// descarte pelos prazos da politica: uma vez por dia, e uma vez ao subir
setInterval(() => {
  aplicarRetencao().catch(() => {});
}, 24 * 60 * 60 * 1000).unref();
aplicarRetencao().catch(() => {});

try {
  await app.listen({ port: config.porta, host: '0.0.0.0' });
  console.log(`site no ar em http://0.0.0.0:${config.porta}`);
} catch (erro) {
  app.log.error(erro);
  process.exit(1);
}
