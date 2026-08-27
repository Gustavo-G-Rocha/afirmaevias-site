// Consentimento de cookies. A escolha fica no localStorage para o navegador
// e vai para o banco como prova, junto com a versao da politica.
const CHAVE = 'ae_cookies';
const CHAVE_VISITANTE = 'ae_visitante';
const banner = document.getElementById('cookies');
const opcoes = document.getElementById('cookies-opcoes');
const acoesPrincipais = banner?.querySelector('.cookies__acoes--principal');

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

function marcarOpcoes(escolha) {
  if (!opcoes || !escolha) return;
  const analiticos = opcoes.querySelector('input[name="analiticos"]');
  const marketing = opcoes.querySelector('input[name="marketing"]');
  if (analiticos) analiticos.checked = Boolean(escolha.analiticos);
  if (marketing) marketing.checked = Boolean(escolha.marketing);
}

function abrirDetalhes() {
  const escolha = escolhaSalva();
  if (escolha) marcarOpcoes(escolha);
  abrirBanner(true);
}

async function registrar(escolha) {
  localStorage.setItem(CHAVE, JSON.stringify({ ...escolha, em: new Date().toISOString() }));
  if (banner) banner.hidden = true;
  reservarEspaco();
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
  if (opcoes) opcoes.hidden = !mostrarOpcoes;
  if (acoesPrincipais) acoesPrincipais.hidden = Boolean(mostrarOpcoes);
  banner.classList.toggle('is-detalhando', Boolean(mostrarOpcoes));
  reservarEspaco();
}

if (banner) {
  if (!escolhaSalva()) abrirBanner(false);

  banner.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-cookies]')?.dataset.cookies;
    if (!acao) return;

    if (acao === 'ajustar') return abrirDetalhes();
    if (acao === 'voltar') return abrirBanner(false);
    if (acao === 'aceitar') return registrar({ analiticos: true, marketing: true });
    if (acao === 'recusar') return registrar({ analiticos: false, marketing: false });
    if (acao === 'salvar') {
      return registrar({
        analiticos: Boolean(opcoes?.querySelector('input[name="analiticos"]')?.checked),
        marketing: Boolean(opcoes?.querySelector('input[name="marketing"]')?.checked)
      });
    }
  });
}

document.querySelectorAll('[data-abrir-cookies]').forEach((botao) => {
  botao.addEventListener('click', () => {
    abrirBanner(false);
    banner?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });
});

// O banner e fixo no rodape e cobria o fim da pagina: no /contato ele tapava
// justamente a caixa de aceite e o botao de enviar. Reservamos no body a
// altura que ele ocupa, medida de verdade porque ela muda ao abrir as opcoes.
function reservarEspaco() {
  const altura = !banner || banner.hidden ? 0 : Math.ceil(banner.getBoundingClientRect().height);
  document.body.style.setProperty('--espaco-cookies', altura + 'px');
}

if (banner) {
  if (typeof ResizeObserver === 'function') new ResizeObserver(reservarEspaco).observe(banner);
  window.addEventListener('resize', reservarEspaco);
  reservarEspaco();
}
