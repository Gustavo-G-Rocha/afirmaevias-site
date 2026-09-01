// Descarte automatico pelos prazos que a Politica de Privacidade declara.
// Sem isto o site prometia eliminacao que ninguem executava - pior que nao
// prometer, porque cada titular pode exigir a comprovacao (LGPD, art. 15 e 16).
//
// Os prazos abaixo espelham a secao "Por quanto tempo guardamos" de content.ts.
// Mudou la, muda aqui.
import { consultar } from './db.js';

type Regra = { rotulo: string; sql: string };

const REGRAS: Regra[] = [
  {
    rotulo: 'currículos com mais de 12 meses',
    sql: `DELETE FROM candidaturas WHERE criado_em < now() - interval '12 months'`
  },
  {
    rotulo: 'contatos comerciais com mais de 24 meses',
    sql: `DELETE FROM contatos WHERE criado_em < now() - interval '24 months'`
  },
  {
    // o Marco Civil pede 6 meses de guarda; passado o prazo o IP deixa de ser
    // necessario, entao some so a coluna e o registro em si e preservado
    rotulo: 'IPs de contato com mais de 6 meses',
    sql: `UPDATE contatos SET ip = NULL, user_agent = NULL
           WHERE ip IS NOT NULL AND criado_em < now() - interval '6 months'`
  },
  {
    rotulo: 'IPs de candidatura com mais de 6 meses',
    sql: `UPDATE candidaturas SET ip = NULL, user_agent = NULL
           WHERE ip IS NOT NULL AND criado_em < now() - interval '6 months'`
  },
  {
    rotulo: 'requisições de titular com mais de 5 anos',
    sql: `DELETE FROM solicitacoes_lgpd WHERE criado_em < now() - interval '5 years'`
  },
  {
    // o freio de login usa janela de 15 minutos; guardar mais que um dia so
    // faria a tabela crescer sem servir para nada
    rotulo: 'tentativas de login com mais de 24 horas',
    sql: `DELETE FROM tentativas_login WHERE criado_em < now() - interval '24 hours'`
  },
  {
    rotulo: 'consentimentos de cookies com mais de 5 anos',
    sql: `DELETE FROM consentimentos_cookies WHERE criado_em < now() - interval '5 years'`
  }
];

// Relatos de integridade nao entram: o prazo conta a partir do fim da apuracao,
// que e decisao humana registrada no painel, nao data de criacao.

export async function aplicarRetencao() {
  for (const regra of REGRAS) {
    try {
      const resultado = await consultar(`${regra.sql} RETURNING 1`);
      if (resultado.length > 0) console.log(`retenção: ${resultado.length} ${regra.rotulo}`);
    } catch (falha) {
      console.error(`retenção falhou em "${regra.rotulo}":`, falha instanceof Error ? falha.message : falha);
    }
  }
}
