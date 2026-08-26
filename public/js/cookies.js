// Consentimento de cookies. A escolha fica no localStorage para o navegador
// e vai para o banco como prova, junto com a versao da politica.
const CHAVE = 'ae_cookies';
const CHAVE_VISITANTE = 'ae_visitante';
const banner = document.getElementById('cookies');
const opcoes = document.getElementById('cookies-opcoes');

function idVisitante() {
  let id = localStorage.getItem(CHAVE_VISITANTE);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CHAVE_VISITANTE, id);
  }
  return id;
}

function escolhaSalva() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) || 'null');
  } catch {
    return null;
  }
}

async function registrar(escolha) {
  localStorage.setItem(CHAVE, JSON.stringify({ ...escolha, em: new Date().toISOString() }));
  if (banner) banner.hidden = true;
  document.dispatchEvent(new CustomEvent('cookies:escolhido', { detail: escolha }));

  try {
    await fetch('/api/consentimento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitanteId: idVisitante(), ...escolha })
    });
  } catch {
    // se o registro falhar, a escolha local continua valendo
  }
}

function abrirBanner(mostrarOpcoes) {
  if (!banner) return;
  banner.hidden = false;
  if (mostrarOpcoes && opcoes) {
    opcoes.hidden = false;
    banner.querySelector('[data-cookies="salvar"]').hidden = false;
    banner.querySelector('[data-cookies="ajustar"]').hidden = true;
  }
}

if (banner) {
  if (!escolhaSalva()) abrirBanner(false);

  banner.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-cookies]')?.dataset.cookies;
    if (!acao) return;

    if (acao === 'ajustar') {
      opcoes.hidden = false;
      banner.querySelector('[data-cookies="salvar"]').hidden = false;
      evento.target.hidden = true;
      return;
    }
    if (acao === 'aceitar') return registrar({ analiticos: true, marketing: true });
    if (acao === 'recusar') return registrar({ analiticos: false, marketing: false });
    if (acao === 'salvar') {
      return registrar({
        analiticos: opcoes.querySelector('input[name="analiticos"]').checked,
        marketing: opcoes.querySelector('input[name="marketing"]').checked
      });
    }
  });
}

document.querySelectorAll('[data-abrir-cookies]').forEach((botao) => {
  botao.addEventListener('click', () => {
    const escolha = escolhaSalva();
    if (escolha && opcoes) {
      opcoes.querySelector('input[name="analiticos"]').checked = Boolean(escolha.analiticos);
      opcoes.querySelector('input[name="marketing"]').checked = Boolean(escolha.marketing);
    }
    abrirBanner(true);
    banner?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });
});
