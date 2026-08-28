import type { FastifyInstance } from 'fastify';
import * as conteudo from '../content.js';
import { config } from '../config.js';

export async function rotasSite(app: FastifyInstance) {
  app.get('/', async (_req, reply) =>
    reply.view('pages/home', {
      titulo: 'Afirma E-vias | Engenharia viária',
      descricao:
        'Estudos, projetos, supervisão e controle tecnológico de obras rodoviárias e urbanas. Mais de 20 anos de tradição e inovação.',
      rotaAtual: '/',
      home: conteudo.home,
      indicadores: conteudo.indicadores
    })
  );

  app.get('/afirma-evias', async (_req, reply) =>
    reply.view('pages/sobre', {
      titulo: 'A empresa | Afirma E-vias',
      descricao:
        'A história da Afirma E-vias: a união da Afirma Engenharia (2002) com a E-vias (2016), consolidada na fusão de 2024.',
      rotaAtual: '/afirma-evias',
      sobre: conteudo.sobre,
      indicadores: conteudo.indicadores
    })
  );

  app.get('/servicos', async (_req, reply) =>
    reply.view('pages/servicos', {
      titulo: 'Serviços | Afirma E-vias',
      descricao:
        'Supervisão e controle tecnológico, projetos em BIM, consultoria, laboratórios fixos e móveis, sondagens, ensaios e levantamentos.',
      rotaAtual: '/servicos',
      notaMarcas: conteudo.notaMarcas,
      servicos: conteudo.servicos
    })
  );

  app.get('/aplicativo', async (_req, reply) =>
    reply.view('pages/aplicativo', {
      titulo: 'Aplicativo | Afirma E-vias',
      descricao:
        'O app Afirma E-vias conecta campo e escritório: ensaios georreferenciados, alertas de não conformidade e dashboards analíticos.',
      rotaAtual: '/aplicativo',
      aplicativo: conteudo.aplicativo
    })
  );

  app.get('/acreditacao-e-certificacao', async (_req, reply) =>
    reply.view('pages/acreditacao', {
      titulo: 'Acreditação e certificação | Afirma E-vias',
      descricao:
        'ISO 9001, política da qualidade, missão, visão, valores e comunicado sobre a acreditação ISO/IEC 17025.',
      rotaAtual: '/acreditacao-e-certificacao',
      acreditacao: conteudo.acreditacao
    })
  );

  app.get('/programa-de-integridade', async (_req, reply) =>
    reply.view('pages/integridade', {
      titulo: 'Programa de integridade | Afirma E-vias',
      descricao:
        'Compliance, Código de Ética e Conduta e canal de denúncias anônimo e seguro operado por empresa independente.',
      rotaAtual: '/programa-de-integridade',
      integridade: conteudo.integridade,
      enviado: null,
      protocolo: null,
      erro: null,
      valores: {}
    })
  );

  app.get('/trabalhe-com-a-gente', async (_req, reply) =>
    reply.view('pages/vagas', {
      titulo: 'Trabalhe com a gente | Afirma E-vias',
      descricao:
        'Vagas em engenharia de projetos, supervisão de obras, laboratório, topografia e BIM. Envie seu currículo para a Afirma E-vias — guardamos por 12 meses e avaliamos cada envio.',
      rotaAtual: '/trabalhe-com-a-gente',
      vagas: conteudo.vagas,
      enviado: false,
      erros: [],
      valores: {}
    })
  );

  app.get('/contato', async (_req, reply) =>
    reply.view('pages/contato', {
      titulo: 'Contato | Afirma E-vias',
      descricao:
        'Fale com a Afirma E-vias sobre controle tecnológico, projetos viários, sondagens ou laboratório. Escritórios em Curitiba/PR e Marília/SP, com atendimento por telefone, WhatsApp e formulário.',
      rotaAtual: '/contato',
      enviado: false,
      erro: null,
      valores: {}
    })
  );

  app.get('/politica-de-privacidade', async (_req, reply) =>
    reply.view('pages/privacidade', {
      titulo: 'Política de privacidade | Afirma E-vias',
      descricao: 'Como a Afirma E-vias trata dados pessoais, nos termos da LGPD (Lei 13.709/2018).',
      rotaAtual: '/politica-de-privacidade',
      privacidade: conteudo.privacidade,
      cookies: conteudo.cookies
    })
  );

  app.get('/termos-de-uso', async (_req, reply) =>
    reply.view('pages/termos', {
      titulo: 'Termos de uso | Afirma E-vias',
      descricao:
        'Condições de uso do site da Afirma E-vias: responsabilidades, propriedade intelectual, uso dos formulários e canais oficiais de atendimento.',
      rotaAtual: '/termos-de-uso',
      termos: conteudo.termos
    })
  );

  app.get('/portal-do-titular', async (_req, reply) =>
    reply.view('pages/lgpd', {
      titulo: 'Portal do titular | Afirma E-vias',
      descricao:
        'Exerça seus direitos de titular de dados pessoais previstos no art. 18 da LGPD. Resposta em até 15 dias com protocolo.',
      rotaAtual: '/portal-do-titular',
      tipos: conteudo.tiposSolicitacaoLgpd,
      enviado: null,
      protocolo: null,
      erro: null,
      valores: {}
    })
  );

  app.get('/bruno_magalhaes', async (_req, reply) =>
    reply.view('pages/extra', {
      titulo: 'Bruno Magalhães | Afirma E-vias',
      descricao: '',
      rotaAtual: '/bruno_magalhaes',
      naoIndexar: true,
      pecas: conteudo.pecas
    })
  );

  app.get('/robots.txt', async (_req, reply) => {
    reply.type('text/plain');
    return `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${
      config.siteUrl.replace(/\/$/, '')
    }/sitemap.xml\n`;
  });

  app.get('/sitemap.xml', async (_req, reply) => {
    const rotas = [
      '/',
      '/afirma-evias',
      '/servicos',
      '/aplicativo',
      '/acreditacao-e-certificacao',
      '/programa-de-integridade',
      '/trabalhe-com-a-gente',
      '/contato',
      '/politica-de-privacidade',
      '/termos-de-uso',
      '/portal-do-titular'
    ];
    const base = config.siteUrl.replace(/\/$/, '');
    reply.type('application/xml');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rotas.map((rota) => `  <url><loc>${base}${rota}</loc></url>`).join('\n')}
</urlset>`;
  });
}
