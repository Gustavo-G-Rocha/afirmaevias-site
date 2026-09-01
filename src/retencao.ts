// Descarte automatico pelos prazos que a Politica de Privacidade declara.
// Sem isto o site prometia eliminacao que ninguem executava - pior que nao
// prometer, porque cada titular pode exigir a comprovacao (LGPD, art. 15 e 16).
//
// Os prazos abaixo espelham a secao "Por quanto tempo guardamos" de content.ts.
// Mudou la, muda aqui.
import { consultar } from './db.js';
import { REGRAS } from './regras-retencao.js';

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
