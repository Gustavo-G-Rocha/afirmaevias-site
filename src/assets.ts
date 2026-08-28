// Versao dos arquivos estaticos, para poder cachear por muito tempo sem
// prender o visitante numa versao velha.
//
// Antes /css/site.css tinha nome fixo e Cache-Control de 7 dias: quem ja
// tinha visitado ficava ate uma semana com o CSS antigo depois de cada deploy,
// e nenhuma correcao de layout chegava a essas pessoas. Agora o caminho leva
// um hash do conteudo (/css/site.css?v=abc123) e o cache pode ser longo:
// mudou o arquivo, muda a query, o navegador busca de novo na hora.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(process.cwd(), 'public');
const cache = new Map<string, string>();

function versaoDe(caminhoPublico: string) {
  const emCache = cache.get(caminhoPublico);
  if (emCache) return emCache;

  let versao = 'dev';
  try {
    const conteudo = fs.readFileSync(path.join(raiz, caminhoPublico));
    versao = crypto.createHash('sha1').update(conteudo).digest('hex').slice(0, 10);
  } catch {
    // arquivo ausente: segue sem versao em vez de derrubar a pagina
  }
  cache.set(caminhoPublico, versao);
  return versao;
}

/** Caminho do estatico com a versao embutida, para uso nas views. */
export function asset(caminhoPublico: string) {
  return `${caminhoPublico}?v=${versaoDe(caminhoPublico.replace(/^\//, ''))}`;
}
