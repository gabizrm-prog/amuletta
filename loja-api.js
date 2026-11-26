// Quando o site roda junto com o sistema (container Docker), o catálogo vem do banco de dados:
// o que a equipe cadastra em /admin/produtos aparece aqui. No GitHub Pages não existe a API,
// então o site continua com a lista fixa do app.js.
fetch('api/produtos', { cache: 'no-store' })
  .then((resposta) => (resposta.ok ? resposta.json() : Promise.reject(resposta.status)))
  .then((lista) => {
    if (!Array.isArray(lista)) return;
    PRODUCTS.splice(0, PRODUCTS.length, ...lista);
    const existe = (id) => PRODUCTS.some((p) => p.id === id);
    [...state.cart.keys()].filter((id) => !existe(id)).forEach((id) => state.cart.delete(id));
    [...state.favs].filter((id) => !existe(id)).forEach((id) => state.favs.delete(id));
    const linkAdmin = document.getElementById('link-admin');
    if (linkAdmin) linkAdmin.hidden = false;
    render();
  })
  .catch(() => { /* sem API: mantém o catálogo do protótipo */ });
