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
  image: `${base}/img/og.png`,
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
    about: { '@id': `${base}/#organizacao` }
  });

  return escapar(JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo }));
}
