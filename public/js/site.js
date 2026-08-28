// menu mobile
const menuBotao = document.getElementById('menu-botao');
const navegacao = document.getElementById('navegacao');

if (menuBotao && navegacao) {
  menuBotao.addEventListener('click', () => {
    const aberto = menuBotao.getAttribute('aria-expanded') === 'true';
    menuBotao.setAttribute('aria-expanded', String(!aberto));
    navegacao.classList.toggle('is-aberta', !aberto);
    document.body.style.overflow = !aberto ? 'hidden' : '';
  });

  navegacao.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuBotao.setAttribute('aria-expanded', 'false');
      navegacao.classList.remove('is-aberta');
      document.body.style.overflow = '';
    });
  });
}

// barra de progresso de leitura
const progresso = document.getElementById('progresso');
if (progresso) {
  const atualizarProgresso = () => {
    const altura = document.documentElement.scrollHeight - window.innerHeight;
    const razao = altura > 0 ? window.scrollY / altura : 0;
    progresso.style.width = `${Math.min(100, razao * 100)}%`;
  };
  window.addEventListener('scroll', atualizarProgresso, { passive: true });
  atualizarProgresso();
}

// revelar blocos ao entrar na tela
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const paraRevelar = document.querySelectorAll('[data-revelar]');

if (reduzirMovimento || !('IntersectionObserver' in window)) {
  paraRevelar.forEach((elemento) => elemento.classList.add('is-visivel'));
} else {
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada, indice) => {
        if (entrada.isIntersecting) {
          setTimeout(() => entrada.target.classList.add('is-visivel'), indice * 70);
          observador.unobserve(entrada.target);
        }
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
  );
  paraRevelar.forEach((elemento) => observador.observe(elemento));
}

// indice da pagina de servicos acompanha o scroll
const linksIndice = document.querySelectorAll('.indice__lista a');
if (linksIndice.length > 0 && 'IntersectionObserver' in window) {
  const secoes = [...linksIndice].map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observadorSecoes = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        linksIndice.forEach((link) => link.classList.remove('is-visivel'));
        const ativo = document.querySelector(`.indice__lista a[href="#${entrada.target.id}"]`);
        if (ativo) ativo.classList.add('is-visivel');
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );
  secoes.forEach((secao) => observadorSecoes.observe(secao));
}

// campo de identificacao do relato de integridade
const opcoesAnonimo = document.querySelectorAll('input[name="anonimo"]');
const blocoIdentificacao = document.querySelector('.identificacao');
if (opcoesAnonimo.length > 0 && blocoIdentificacao) {
  const alternar = () => {
    const querSeIdentificar = document.querySelector('input[name="anonimo"]:checked')?.value === 'nao';
    blocoIdentificacao.hidden = !querSeIdentificar;
  };
  opcoesAnonimo.forEach((opcao) => opcao.addEventListener('change', alternar));
  alternar();
}

// currículo: confirma o arquivo escolhido e barra o tamanho antes do upload,
// para o candidato nao esperar 5 MB subirem so para receber recusa
document.querySelectorAll('input[type="file"][data-limite-mb]').forEach((campo) => {
  const alvo = document.querySelector(campo.dataset.alvo);
  if (!alvo) return;
  const padrao = alvo.textContent;
  const limite = Number(campo.dataset.limiteMb) * 1024 * 1024;

  campo.addEventListener('change', () => {
    const arquivo = campo.files[0];
    if (!arquivo) {
      alvo.textContent = padrao;
      alvo.classList.remove('campo__ajuda--erro', 'campo__ajuda--ok');
      return;
    }
    const mb = (arquivo.size / 1024 / 1024).toFixed(1).replace('.', ',');
    if (arquivo.size > limite) {
      campo.value = '';
      alvo.textContent = `${arquivo.name} tem ${mb} MB e o limite e 5 MB. Salve como PDF e anexe de novo.`;
      alvo.classList.add('campo__ajuda--erro');
      alvo.classList.remove('campo__ajuda--ok');
      return;
    }
    alvo.textContent = `${arquivo.name} · ${mb} MB`;
    alvo.classList.add('campo__ajuda--ok');
    alvo.classList.remove('campo__ajuda--erro');
  });
});

// Quando o formulário volta com erro, o aviso fica no topo e o visitante já
// rolou até o botão: sem mover o foco, quem usa teclado ou leitor de tela não
// descobre que algo falhou.
const avisoDeErro = document.querySelector('.alerta[role="alert"]');
if (avisoDeErro) {
  avisoDeErro.scrollIntoView({ block: 'center' });
  avisoDeErro.focus({ preventScroll: true });
}
