// Duas coisas acontecem aqui: o audio tenta tocar sozinho no volume maximo,
// e as pecas atravessam a tela em trajetorias sorteadas.
//
// Sobre o autoplay: navegador nenhum libera som sem gesto do usuario, a menos
// que a pessoa ja tenha historico de interacao com o dominio. Entao tentamos
// tocar direto e, se o player recusar, uma cortina cobre a tela e o primeiro
// clique em qualquer lugar destrava. Nao ha como forcar mais do que isso.
(function () {
  const tela = document.getElementById('tela');
  const cortina = document.getElementById('cortina');
  if (!tela) return;

  const ID = tela.dataset.video;
  const ARQUIVOS = JSON.parse(tela.dataset.pecas || '[]');
  const CALMO = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------- as pecas
  const CONCORRENTES = CALMO ? 6 : 26;
  const sorte = (min, max) => min + Math.random() * (max - min);

  function lancar(el) {
    const alturaTela = innerHeight;
    const escala = sorte(0.35, 1.15);
    const duracao = sorte(CALMO ? 14 : 4, CALMO ? 22 : 13);
    const daEsquerda = Math.random() < 0.5;
    const giroInicial = sorte(-25, 25);
    const giroFinal = giroInicial + sorte(-540, 540);
    const y = sorte(-60, alturaTela - 120);
    const desvioY = sorte(-160, 160);

    el.style.setProperty('--escala', escala.toFixed(2));
    el.style.top = `${y}px`;

    const largura = 289 * escala;
    const partida = daEsquerda ? -largura - 40 : innerWidth + 40;
    const chegada = daEsquerda ? innerWidth + 40 : -largura - 40;

    const animacao = el.animate(
      [
        { transform: `translate(${partida}px, 0) rotate(${giroInicial}deg) scale(${escala})` },
        { transform: `translate(${chegada}px, ${desvioY}px) rotate(${giroFinal}deg) scale(${escala})` }
      ],
      { duration: duracao * 1000, easing: 'linear' }
    );
    animacao.onfinish = () => {
      el.src = `/img/pecas/${ARQUIVOS[(Math.random() * ARQUIVOS.length) | 0]}`;
      lancar(el);
    };
  }

  for (let i = 0; i < CONCORRENTES; i++) {
    const el = document.createElement('img');
    el.className = 'tela__peca';
    el.src = `/img/pecas/${ARQUIVOS[(Math.random() * ARQUIVOS.length) | 0]}`;
    el.alt = '';
    el.setAttribute('aria-hidden', 'true');
    el.decoding = 'async';
    tela.appendChild(el);
    // escalona a largada para nao entrarem todas juntas
    setTimeout(() => lancar(el), Math.random() * (CALMO ? 8000 : 5000));
  }

  // ------------------------------------------------------------- a musica
  let player = null;

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('som', {
      videoId: ID,
      playerVars: { autoplay: 1, controls: 0, playsinline: 1, rel: 0, loop: 1, playlist: ID },
      events: {
        onReady: (e) => {
          e.target.unMute();
          e.target.setVolume(100);
          e.target.playVideo();
          // se em 1,2 s nao estiver tocando, o navegador barrou: pede o clique
          setTimeout(() => {
            if (e.target.getPlayerState() !== YT.PlayerState.PLAYING) pedirClique();
          }, 1200);
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) cortina?.setAttribute('hidden', '');
        }
      }
    });
  };

  function pedirClique() {
    if (!cortina) return;
    cortina.removeAttribute('hidden');
  }

  function liberarSom() {
    if (!player) return;
    player.unMute();
    player.setVolume(100);
    player.playVideo();
  }

  document.addEventListener('click', liberarSom);
  document.addEventListener('keydown', liberarSom);
  document.addEventListener('touchstart', liberarSom, { passive: true });

  const api = document.createElement('script');
  api.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(api);
})();
