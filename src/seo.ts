// Dados estruturados (JSON-LD). O site nao tinha nenhum: para uma empresa com
// dois enderecos fisicos, CNPJ e certificacao, o bloco Organization e o minimo
// que o Google usa para montar o painel de conhecimento e o resultado rico.
import { config } from './config.js';
import * as conteudo from './content.js';

const base = config.siteUrl.replace(/\/$/, '');

// o CEP mora no fim da linha 2 ("Bairro — Cidade/UF, 00000-000")
function cep(linha: string) {
  return linha.match(/\d{5}-\d{3}/)?.[0];
}

const enderecos = conteudo.empresa.enderecos.map((endereco) => ({
  '@type': 'PostalAddress',
  streetAddress: endereco.linha1,
  addressLocality: endereco.cidade,
  addressRegion: endereco.uf,
  postalCode: cep(endereco.linha2),
  addressCountry: 'BR'
}));

const organizacao = {
  '@type': 'Organization',
  '@id': `${base}/#organizacao`,
  name: conteudo.empresa.nome,
  legalName: conteudo.empresa.razaoSocial,
  taxID: conteudo.empresa.cnpj,
  url: base,
  logo: `${base}/img/logo-horizontal-escuro.png`,
  image: `${base}/img/og.jpg`,
  email: conteudo.empresa.email,
  telephone: conteudo.empresa.telefoneFixo,
  address: enderecos,
  sameAs: [conteudo.empresa.linkedin, conteudo.empresa.instagram],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'comercial',
      email: conteudo.empresa.email,
      telephone: conteudo.empresa.telefoneFixo,
      availableLanguage: 'pt-BR'
    },
    {
      '@type': 'ContactPoint',
      contactType: 'privacidade',
      email: conteudo.empresa.emailEncarregado,
      availableLanguage: 'pt-BR'
    }
  ]
};

const site = {
  '@type': 'WebSite',
  '@id': `${base}/#site`,
  url: base,
  name: conteudo.empresa.nome,
  inLanguage: 'pt-BR',
  publisher: { '@id': `${base}/#organizacao` }
};

// </script> dentro do JSON fecharia a tag antes da hora
const escapar = (json: string) => json.replace(/</g, '\u003c');

// Nome curto de cada rota para a trilha. O menu cobre as principais; as
// juridicas nao estao la e entram aqui, senao o Google monta a trilha sozinho
// a partir da URL e sai "portal-do-titular" no resultado de busca.
const NOMES: Record<string, string> = {
  ...Object.fromEntries(conteudo.navegacao.map((i) => [i.href, i.rotulo])),
  '/trabalhe-com-a-gente': 'Trabalhe com a gente',
  '/politica-de-privacidade': 'Política de privacidade',
  '/termos-de-uso': 'Termos de uso',
  '/portal-do-titular': 'Portal do titular',
  '/acessibilidade': 'Acessibilidade'
};

function trilha(rotaAtual: string) {
  const itens: Record<string, unknown>[] = [
    { '@type': 'ListItem', position: 1, name: 'Início', item: base }
  ];
  const nome = NOMES[rotaAtual];
  if (nome) {
    itens.push({ '@type': 'ListItem', position: 2, name: nome, item: `${base}${rotaAtual}` });
  }
  return { '@type': 'BreadcrumbList', '@id': `${base}${rotaAtual}#trilha`, itemListElement: itens };
}

export function dadosEstruturados(rotaAtual: string, titulo: string, descricao: string) {
  const grafo: Record<string, unknown>[] = [organizacao, site];

  grafo.push({
    '@type': 'WebPage',
    '@id': `${base}${rotaAtual}#pagina`,
    url: `${base}${rotaAtual}`,
    name: titulo,
    description: descricao,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': `${base}/#site` },
    about: { '@id': `${base}/#organizacao` },
    primaryImageOfPage: `${base}/img/og.jpg`,
    breadcrumb: { '@id': `${base}${rotaAtual}#trilha` }
  });

  // a home nao tem trilha propria: ela e a raiz
  if (rotaAtual !== '/') grafo.push(trilha(rotaAtual));

  return escapar(JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo }));
}
