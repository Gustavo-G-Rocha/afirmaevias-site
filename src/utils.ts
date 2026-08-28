import crypto from 'node:crypto';

export function gerarProtocolo(prefixo: string) {
  const agora = new Date();
  const ano = agora.getFullYear();
  const aleatorio = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefixo}-${ano}-${aleatorio}`;
}

export function hashIp(ip: string) {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

export function limpar(valor: unknown, tamanhoMaximo = 2000) {
  if (typeof valor !== 'string') return '';
  return valor.trim().slice(0, tamanhoMaximo);
}

export function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function formatarData(valor: Date | string | null) {
  if (!valor) return '—';
  const data = typeof valor === 'string' ? new Date(valor) : valor;
  return data.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function formatarDataCurta(valor: Date | string | null) {
  if (!valor) return '—';
  const data = typeof valor === 'string' ? new Date(valor) : valor;
  return data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function paraCsv(linhas: Record<string, any>[]) {
  if (linhas.length === 0) return '';
  const colunas = Object.keys(linhas[0]);
  const escapar = (valor: any) => {
    if (valor === null || valor === undefined) return '';
    const texto = String(valor).replace(/"/g, '""');
    return `"${texto}"`;
  };
  const corpo = linhas.map((linha) => colunas.map((coluna) => escapar(linha[coluna])).join(';'));
  return [colunas.join(';'), ...corpo].join('\r\n');
}

/**
 * Monta o Content-Disposition de um anexo.
 *
 * Dois problemas resolvidos aqui. O nome do arquivo vem do visitante e o
 * limpar() so tira espaco das pontas: uma quebra de linha no meio sobrevivia
 * e ia parar dentro de um cabecalho HTTP, onde o Node recusa o caractere e
 * derruba o download com erro 500. E nome com acento — "Curriculo Jose.pdf" e
 * o caso comum aqui — nao cabe em cabecalho ASCII: sem a forma RFC 5987 o
 * navegador salva o arquivo com o nome corrompido.
 */
export function cabecalhoAnexo(nome: string) {
  const proibidos = /[\u0000-\u001f\u007f\u0022\u005c]/g;
  const limpo = nome.replace(proibidos, '').trim() || 'arquivo';
  const semAcento = limpo.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const ascii = semAcento.replace(/[^\u0020-\u007e]/g, '_') || 'arquivo';
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(limpo)}`;
}
