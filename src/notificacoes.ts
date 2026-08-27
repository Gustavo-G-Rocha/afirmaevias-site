// Aviso por e-mail de que chegou algo nos formularios. Sem isto, contato,
// curriculo, relato e pedido LGPD so existem para quem abre o /admin - e o
// pedido LGPD tem prazo legal de 15 dias correndo.
//
// Usa a API HTTP da Resend via fetch nativo: nenhuma dependencia nova. Sem
// RESEND_API_KEY configurada o envio e ignorado com um aviso no log, entao o
// site funciona igual antes ate a chave existir.
import { config, producao } from './config.js';

const CHAVE = process.env.RESEND_API_KEY ?? '';
const REMETENTE = process.env.EMAIL_REMETENTE ?? 'site@afirmaevias.com.br';

// destino por tipo, com o comercial como padrao
const DESTINOS: Record<string, string> = {
  contato: process.env.EMAIL_CONTATO ?? 'comercial@afirmaevias.com.br',
  candidatura: process.env.EMAIL_RH ?? 'comercial@afirmaevias.com.br',
  relato: process.env.EMAIL_COMPLIANCE ?? 'comercial@afirmaevias.com.br',
  lgpd: process.env.EMAIL_ENCARREGADO ?? 'privacidade@afirmaevias.com.br'
};

let avisouFaltaChave = false;

function escapar(texto: string) {
  return texto.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

type Aviso = {
  tipo: keyof typeof DESTINOS | string;
  assunto: string;
  linhas: [string, string][];
  caminhoAdmin: string;
};

// Nunca lanca: o formulario ja gravou no banco e a falha de e-mail nao pode
// derrubar a resposta para quem enviou.
export async function avisarEquipe(aviso: Aviso) {
  if (!CHAVE) {
    if (!avisouFaltaChave) {
      avisouFaltaChave = true;
      console.warn('RESEND_API_KEY ausente: avisos por e-mail desligados, os registros seguem so no /admin');
    }
    return;
  }

  const destino = DESTINOS[aviso.tipo] ?? DESTINOS.contato;
  const url = `${config.siteUrl.replace(/\/$/, '')}${aviso.caminhoAdmin}`;
  const corpo = aviso.linhas
    .map(([rotulo, valor]) => `<p><strong>${escapar(rotulo)}:</strong><br>${escapar(valor || '—').replace(/\n/g, '<br>')}</p>`)
    .join('');

  try {
    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${CHAVE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `Site Afirma E-vias <${REMETENTE}>`,
        to: [destino],
        subject: producao ? aviso.assunto : `[teste] ${aviso.assunto}`,
        html: `${corpo}<p><a href="${url}">Abrir no painel</a></p>`
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!resposta.ok) {
      console.error('falha ao enviar aviso:', resposta.status, await resposta.text().catch(() => ''));
    }
  } catch (falha) {
    console.error('falha ao enviar aviso:', falha instanceof Error ? falha.message : falha);
  }
}
