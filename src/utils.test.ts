// Testes das funções puras que sustentam formulário, exportação e download.
// Rodam com o test runner do próprio Node: nenhuma dependência nova.
//   npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  limpar,
  emailValido,
  paraCsv,
  cabecalhoAnexo,
  assinaturaConfere,
  gerarProtocolo,
  hashIp
} from './utils.js';

test('limpar corta espaço das pontas e respeita o tamanho máximo', () => {
  assert.equal(limpar('  oi  '), 'oi');
  assert.equal(limpar('abcdef', 3), 'abc');
  assert.equal(limpar(undefined), '');
  assert.equal(limpar(42 as unknown as string), '');
});

test('emailValido aceita endereço comum e recusa os quebrados', () => {
  for (const bom of ['a@b.co', 'gustavo.rocha@afirmaevias.com.br', 'x+y@dominio.com']) {
    assert.equal(emailValido(bom), true, bom);
  }
  for (const ruim of ['', 'sem-arroba', 'a@b', 'a@@b.co', 'com espaco@b.co']) {
    assert.equal(emailValido(ruim), false, ruim);
  }
});

test('paraCsv monta cabeçalho e escapa aspas', () => {
  const csv = paraCsv([{ nome: 'Ana', obs: 'ela disse "oi"' }]);
  const linhas = csv.split('\r\n');
  assert.equal(linhas[0], 'nome;obs');
  assert.equal(linhas[1], '"Ana";"ela disse ""oi"""');
});

test('paraCsv devolve vazio sem registros', () => {
  assert.equal(paraCsv([]), '');
});

test('paraCsv trata nulo e indefinido como célula vazia', () => {
  const csv = paraCsv([{ a: null, b: undefined, c: 0 }]);
  // campo vazio sai sem aspas; o zero precisa sobreviver como "0" e não sumir
  assert.equal(csv.split('\r\n')[1], ';;"0"');
});

// Regressão: mensagem vinda de formulário público não pode virar fórmula na
// planilha de quem abre a exportação.
test('paraCsv neutraliza início de fórmula', () => {
  const perigosos = ['=1+1', '+1', '-1', '@SUM(A1)', '\t=cmd', '\r=cmd'];
  for (const valor of perigosos) {
    const celula = paraCsv([{ campo: valor }]).split('\r\n')[1];
    assert.ok(celula.startsWith('"\''), `deveria prefixar apóstrofo: ${JSON.stringify(valor)} -> ${celula}`);
  }
  // texto normal não deve ganhar apóstrofo
  const normal = paraCsv([{ campo: 'tudo certo' }]).split('\r\n')[1];
  assert.equal(normal, '"tudo certo"');
});

test('cabecalhoAnexo preserva acento em filename* e sanitiza o ASCII', () => {
  const c = cabecalhoAnexo('Currículo José.pdf');
  assert.match(c, /filename="Curriculo Jose\.pdf"/);
  assert.match(c, /filename\*=UTF-8''Curr%C3%ADculo%20Jos%C3%A9\.pdf/);
});

// Regressão: nome de arquivo é dado do visitante e vai para um cabeçalho HTTP.
// Quebra de linha ali permitiria injetar cabeçalho; o Node recusa e derruba o
// download com 500.
test('cabecalhoAnexo remove quebra de linha, aspas e barra', () => {
  const c = cabecalhoAnexo('nome\r\nX-Injetado: 1"\\.pdf');
  assert.ok(!/[\r\n\\]/.test(c), `sobrou controle ou barra: ${c}`);
  // as únicas aspas devem ser as dois delimitadores de filename="..."
  assert.equal((c.match(/"/g) ?? []).length, 2, c);
});

test('cabecalhoAnexo usa nome padrão quando sobra vazio', () => {
  assert.match(cabecalhoAnexo('   '), /filename="arquivo"/);
});

test('gerarProtocolo segue o formato PREFIXO-ANO-HEX', () => {
  const p = gerarProtocolo('LGPD');
  assert.match(p, new RegExp(`^LGPD-${new Date().getFullYear()}-[0-9A-F]{6}$`));
  assert.notEqual(gerarProtocolo('INT'), gerarProtocolo('INT'));
});

// Regressão: aceitar a extensão quando o MIME chega genérico (necessário no
// celular) abriu espaço para renomear qualquer arquivo para .pdf.
test('assinaturaConfere aceita só o conteúdo real de cada formato', () => {
  const pdf = Buffer.from('%PDF-1.7\nconteudo');
  const docx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
  const doc = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

  assert.equal(assinaturaConfere(pdf, 'pdf'), true);
  assert.equal(assinaturaConfere(docx, 'docx'), true);
  assert.equal(assinaturaConfere(doc, 'doc'), true);

  // executável renomeado para .pdf: MZ no início
  const executavel = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
  assert.equal(assinaturaConfere(executavel, 'pdf'), false);
  // HTML renomeado
  assert.equal(assinaturaConfere(Buffer.from('<script>'), 'pdf'), false);
  // formato certo, extensão trocada
  assert.equal(assinaturaConfere(pdf, 'docx'), false);
  // extensão desconhecida nunca passa
  assert.equal(assinaturaConfere(pdf, 'exe'), false);
  // arquivo curto demais não derruba a função
  assert.equal(assinaturaConfere(Buffer.from([0x25]), 'pdf'), false);
  assert.equal(assinaturaConfere(Buffer.alloc(0), 'pdf'), false);
});

test('hashIp é determinístico e não devolve o IP', () => {
  const h = hashIp('203.0.113.7');
  assert.equal(h, hashIp('203.0.113.7'));
  assert.equal(h.length, 32);
  assert.ok(!h.includes('203'));
});
