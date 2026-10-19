// Aplica o tema escolhido no botão do cabeçalho antes da primeira pintura.
// Fica no <head> e sem defer: com defer a página pintaria no tema do sistema
// e trocaria logo depois. A CSP não aceita script inline, por isso o arquivo.
// Sem escolha gravada, quem decide é o prefers-color-scheme, no próprio CSS.
try {
  const tema = localStorage.getItem('ae_tema');
  if (tema === 'claro' || tema === 'escuro') document.documentElement.dataset.tema = tema;
} catch {
  // armazenamento bloqueado (aba privada, política do navegador): segue o sistema
}
